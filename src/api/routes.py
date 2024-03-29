"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Message
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required 
from werkzeug.security import check_password_hash, generate_password_hash
from flask_socketio import SocketIO, join_room
from datetime import datetime

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api, origins='*')

socketio = SocketIO(cors_allowed_origins=["http://127.0.0.1:3000"])

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_room')
def handle_join_room(data):
    user_id = data['user_id']
    other_user_id = data['other_user_id']
    room_id = ''.join(sorted([str(user_id), str(other_user_id)]))
    join_room(room_id)
    print(f"User {user_id} joined room {room_id}")
    


@api.route('/login', methods=['POST'])
def login_user():
    user_name = request.json.get('user_name')
    password = request.json.get('password')
    user = User.query.filter_by(user_name=user_name).first()

    if user is not None and check_password_hash(user.password, password):
        identity_data = {"user_id": user.id, "user_name": user.user_name}

        access_token = create_access_token(identity=identity_data)

        socketio.emit('login_success', {'user_id': user.id}, namespace='/')

        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "Incorrect user or password"}), 401
    
@api.route('/signup', methods=['POST'])
def create_user():
    email = request.json.get('email')
    user_name = request.json.get('user_name')
    password = request.json.get('password')
    duplicate_email = User.query.filter_by(email=email).first()
    duplicate_user = User.query.filter_by(user_name=user_name).first()
    
    if duplicate_email:
        return jsonify({"msg":"Email already registered"}), 400 
    elif duplicate_user:
        return jsonify({"msg":"User already registered"}), 400
    else:
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        
        user = User(email=email,
                    user_name=user_name,
                    password=hashed_password, 
                    is_active=True)
        
        db.session.add(user) 
        db.session.commit()
        return jsonify({"msg":"User created successfully"}), 200

@api.route('/protected', methods=['GET'])
@jwt_required()
def protected_route():
    user_info = get_jwt_identity()
    if not user_info:
        return jsonify({"msg": "access denied"}), 401

    return jsonify(user_info), 200

@api.route('/change_password', methods=['POST'])
@jwt_required()
def change_password():
    current_password = request.json.get('current_password')
    new_password = request.json.get('new_password')
    confirm_password = request.json.get('confirm_password')

    current_user_identity = get_jwt_identity()

    if not isinstance(current_user_identity, dict) or 'user_name' not in current_user_identity:
        return jsonify({"message": "Invalid user identity format"}), 400
    
    user_name = current_user_identity['user_name']

    user = User.query.filter_by(user_name=user_name).first()

    if not user or not check_password_hash(user.password, current_password):
        return jsonify({"message": "Incorrect current password"}), 401

    if new_password != confirm_password:
        return jsonify({"message": "New password and confirm password do not match"}), 400

    hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')
    user.password = hashed_password
    db.session.commit()

    return jsonify({"message": "Password changed successfully" }), 200

@api.route('/users', methods=['GET'])
@jwt_required() 
def get_users():
    try:
        current_user_data = get_jwt_identity()
        current_user_name = current_user_data.get("user_name") 
        users = User.query.filter(User.user_name != current_user_name).all()
        user_list = [{"id": user.id, "user_name": user.user_name} for user in users]
        
        return jsonify(user_list), 200
   
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/send_message', methods=['POST'])
def send_message():
    try:
        data = request.get_json()
        sender_id = data.get("sender_id")
        receiver_id = data.get('receiver_id')
        message_text = data.get('message_text')

        receiver = User.query.get(receiver_id)
        if not receiver:
            return jsonify({"message": "Receiver not found"}), 404

        room_id = ''.join(sorted([str(sender_id), str(receiver_id)]))

        socketio.emit('new_message', {
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "text": message_text,
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }, room=room_id)

        message = Message(sender_id=sender_id, receiver_id=receiver_id, text=message_text)
        db.session.add(message)
        db.session.commit()

        print(f"Emitting new_message to room {room_id}: {message_text}")

        return jsonify({"message": "Message sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api.route('/message_history', methods=['GET'])
def message_history():
    try:
        sender_id = request.args.get('sender_id')
        receiver_id = request.args.get('receiver_id')

        messages = Message.query.filter(
            (Message.sender_id == sender_id) & (Message.receiver_id == receiver_id) |
            (Message.sender_id == receiver_id) & (Message.receiver_id == sender_id)
        ).order_by(Message.timestamp).all()

        message_history = [{
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "text": message.text,
            "timestamp": message.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        } for message in messages]

        return jsonify(message_history), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

