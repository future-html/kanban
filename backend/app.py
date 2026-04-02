import os
import certifi # <-- 1. Import certifi here
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv
from bson.objectid import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)

mongo_uri = os.getenv("MONGO_URI")

# 2. Add tlsCAFile=certifi.where() to your MongoClient
client = MongoClient(mongo_uri, tlsCAFile=certifi.where())

try:
    client.admin.command('ping')
    print("✅ Successfully connected to Mongodb_users!")
except ConnectionFailure:
    print("❌ Failed to connect to Mongodb_users. Check your connection string.")
# 2. Select the database and collection
db_users = client['kanban']
users_collection = db_users['user']

# --- ROUTES ---

@app.route('/users/<user_id>', methods = ['GET'])
def get_user_by_id(user_id):
    print(user_id, 'user_id')
    query = {"_id": ObjectId(user_id)}
    result = users_collection.find_one(query)
    result['_id'] = str(result['_id'])
    return jsonify({"message": f"User ID received: {user_id}", "data": result}), 200



@app.route('/users', methods=['POST'])
def create_new_user(): 
    data = request.get_json(); 
    print(data['email']); 
    users_collection.insert_one(data)
    print(data);
    return jsonify({"message": "User created successfully"}), 201 

# if use <user_id> it will get user_id in parameter function
# def get_user_by_id(user_id): ==> like this

# if the query parameter ==> /users?userId=123
# it uses request.args.get('userId')


if __name__ == '__main__':
    # Run the Flask app on port 3000
    app.run(debug=True, port=3000)