import os
import certifi
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv
from bson.objectid import ObjectId

# Note: Removed the werkzeug.security imports for this mock project

load_dotenv()

app = Flask(__name__)
CORS(app)

mongo_uri = os.getenv("MONGO_URI")

client = MongoClient(mongo_uri, tlsCAFile=certifi.where())

try:
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB!")
except ConnectionFailure:
    print("❌ Failed to connect to MongoDB. Check your connection string.")

# Select the database and collection
db_users = client['kanban']
user_collection = db_users['user']
todolist_collection = db_users['todolist']


# --- ROUTES ---

@app.route('/signup', methods=['POST'])
def signup():
    """Register a new user and save them to MongoDB."""
    data = request.get_json()

    # 1. Validate that all required fields are present
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields (username, email, password)'}), 400

    # 2. Check if a user with this email already exists
    if user_collection.find_one({'email': data['email']}):
        return jsonify({'error': 'User with this email already exists'}), 409

    # 3. Create the user object (using plain text password for mock project)
    new_user = {
        'username': data['username'],
        'email': data['email'],
        'password': data['password']  # <--- Plain string stored here
    }

    # 4. Insert into database
    result = user_collection.insert_one(new_user)
    
    # 5. Prepare the userInfo object to send back to the frontend (excluding password)
    user_info = {
        'id': str(result.inserted_id),
        'username': new_user['username'],
        'email': new_user['email']
    }

    return jsonify({"message": "User created successfully", "userInfo": user_info}), 201


@app.route('/login', methods=['POST'])
def login():
    """Authenticate a user and return their info to the frontend."""
    data = request.get_json()
    print(data, 'data received from frontend')  # Debugging statement
    print(data.get('email'))
    
    # 1. Validate request payload
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400

    # 2. Find the user by their email in MongoDB
    user = user_collection.find_one({'email': data['email']})

    # 3. Validate user exists AND the plain text passwords match
    if user and user['password'] == data['password']:  # <--- Plain string comparison here
        
        # 4. Prepare the userInfo object to send to the frontend
        # Even in a mock project, it's good practice not to send the password back!
        user_info = {
            'id': str(user['_id']),
            'username': user['username'],
            'email': user['email']
        }
        
        return jsonify({
            "message": "Login successful", 
            "userInfo": user_info
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

# --- NEW ROUTES ---

# 1. GET /user: List all users EXCEPT the currently logged-in user
@app.route('/user', methods=['GET'])
def get_all_other_users():
    owner_id = request.args.get('ownerId')
    
    if not owner_id:
        return jsonify({"error": "ownerId query parameter is required"}), 400

    try:
        # Find all users where _id is NOT EQUAL ($ne) to the ownerId
        # {"password": 0} excludes the password field from the results
        users = list(user_collection.find({"_id": {"$ne": ObjectId(owner_id)}}, {"password": 0}))
        
        # Convert ObjectIds to string for JSON serialization
        for user in users:
            user['_id'] = str(user['_id'])
            
        return jsonify(users), 200
    except Exception:
        return jsonify({"error": "Invalid ownerId format"}), 400



# 3. POST /board: Add a new board
@app.route('/board', methods=['POST'])
def create_board():
    data = request.get_json()
    user_id = data.get('userId')  # <--- Changed to userId
    board_name = data.get('boardName')

    if not user_id or not board_name:
        return jsonify({"error": "userId and boardName are required"}), 400

    try:
        new_board = {
            "_id": ObjectId(), # Generate a new unique ID for this board
            "boardName": board_name,
            "columns": [] # Initialize with empty columns
        }
        
        # 1. Query by userId
        # 2. $push creates/appends to the 'todos' array
        # 3. $setOnInsert ensures 'member' becomes an empty array IF a new document is created
        # 4. upsert=True makes the magic happen (Update if exists, Insert if it doesn't)
        todolist_collection.update_one(
            {"userId": ObjectId(user_id)},
            {
                "$push": {"todos": new_board},
                "$setOnInsert": {"member": []} 
            },
            upsert=True
        )
        
        return jsonify({
            "message": "Board created successfully", 
            "boardId": str(new_board["_id"])
        }), 201
    except Exception:
        return jsonify({"error": "Invalid userId format"}), 400


# 2. POST /user/invite: Invite users to a board
@app.route('/user/invite', methods=['POST'])
def invite_user():
    data = request.get_json()
    owner_id = data.get('ownerId')
    member_ids = data.get('memberId', []) # Expects a list of string IDs
    
    if not owner_id or not member_ids:
        return jsonify({"error": "ownerId and memberId list are required"}), 400

    try:
        # Convert list of string IDs to list of ObjectIds
        member_object_ids = [ObjectId(m_id) for m_id in member_ids]
        
        # $addToSet with $each adds multiple members WITHOUT creating duplicates
        todolist_collection.update_one(
            {"userId": ObjectId(owner_id)},
            {"$addToSet": {"member": {"$each": member_object_ids}}}
        )
        
        # As requested, just return successfully message
        return jsonify({"message": "successfully"}), 200
    except Exception:
         return jsonify({"error": "Invalid ID format"}), 400



# 4. GET /board: Get boards where user is owner OR a member
@app.route('/board', methods=['GET'])
def get_boards():
    user_id = request.args.get('userId')
    
    if not user_id:
        return jsonify({"error": "userId query parameter is required"}), 400

    try:
        # $or operator: Find if user is the owner (userId) OR if user is in the member array
        query = {
            "$or": [
                {"userId": ObjectId(user_id)},
                {"member": ObjectId(user_id)}
            ]
        }
        dashboards = list(todolist_collection.find(query))
        
        # Deep conversion of ObjectIds to strings for the frontend
        for dash in dashboards:
            dash['_id'] = str(dash['_id'])
            dash['userId'] = str(dash['userId'])
            dash['member'] = [str(m) for m in dash.get('member', [])]
            
            for todo in dash.get('todos', []):
                todo['_id'] = str(todo['_id'])
                for col in todo.get('columns', []):
                    col['_id'] = str(col['_id'])
                    for task in col.get('tasks', []):
                        task['_id'] = str(task['_id'])
                        
        return jsonify(dashboards), 200
    except Exception:
        return jsonify({"error": "Invalid userId format"}), 400


# 5. PUT /board: Update a board's name
@app.route('/board', methods=['PUT'])
def update_board():
    data = request.get_json()
    dashboard_id = data.get('dashboardId')
    board_id = data.get('boardId')
    new_name = data.get('newValueOfBoardName')

    if not all([dashboard_id, board_id, new_name]):
        return jsonify({"error": "dashboardId, boardId, and newValueOfBoardName are required"}), 400

    try:
       # it will find array that has _id so it has only one object 
       # but it has many todo so todos._id is making simpler to find board id and update name of board value
        todolist_collection.update_one(
            {"_id": ObjectId(dashboard_id), "todos._id": ObjectId(board_id)},
            {"$set": {"todos.$.boardName": new_name}}
        )
        return jsonify({"message": "Board updated successfully"}), 200
    except Exception:
        return jsonify({"error": "Invalid ID format"}), 400



# 6. DELETE /board: Delete multiple boards by ID (Owner only)
@app.route('/board', methods=['DELETE'])
def delete_boards():
    data = request.get_json()
    user_id = data.get('userId')           # <--- Added userId requirement
    dashboard_id = data.get('dashboardId')
    board_ids = data.get('boardId', [])    # Expects a list of string IDs

    # Validate all 3 fields exist
    if not user_id or not dashboard_id or not board_ids:
         return jsonify({"error": "userId, dashboardId, and boardId list are required"}), 400

    try:
        board_object_ids = [ObjectId(b_id) for b_id in board_ids]
        
        # Security fix: Match BOTH the dashboard's _id AND the owner's userId
        result = todolist_collection.update_one(
            {"_id": ObjectId(dashboard_id), "userId": ObjectId(user_id)},
            {"$pull": {"todos": {"_id": {"$in": board_object_ids}}}}
        )
        
        # If matched_count is 0, the dashboard either doesn't exist OR the user isn't the owner
        if result.matched_count == 0:
            return jsonify({"error": "Dashboard not found or you are not authorized to delete from it"}), 403
            
        return jsonify({"message": "Boards deleted successfully"}), 200
        
    except Exception:
         return jsonify({"error": "Invalid ID format"}), 400
if __name__ == '__main__':
    # Run the Flask app on port 3000
    app.run(debug=True, port=3000)