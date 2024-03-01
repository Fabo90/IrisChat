"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required 
from werkzeug.security import check_password_hash, generate_password_hash

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/login', methods=['POST'])
def login_user():
    user_name = request.json.get('user_name')
    password = request.json.get('password')
    user = User.query.filter_by(user_name=user_name).first()

    if user is not None and check_password_hash(user.password, password):
        identity_data = user.user_name

        access_token = create_access_token(identity=identity_data)
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

    if not isinstance(current_user_identity, str):
        return jsonify({"message": "Invalid user identity format"}), 400

    user = User.query.filter_by(user_name=current_user_identity).first()

    if not user or not check_password_hash(user.password, current_password):
        return jsonify({"message": "Incorrect current password"}), 401

    if new_password != confirm_password:
        return jsonify({"message": "New password and confirm password do not match"}), 400

    hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')
    user.password = hashed_password
    db.session.commit()

    return jsonify({"message": "Password changed successfully" }), 200

@api.route('/user', methods=['GET'])
@jwt_required()  # Require JWT authentication
def get_user():
    try:
        # Get the current user's username from the JWT token
        current_user_name = get_jwt_identity()

        # Fetch all user names excluding the current user
        user_names = User.query.with_entities(User.user_name).filter(User.user_name != current_user_name).all()
        user_names_list = [name[0] for name in user_names]
        
        return jsonify(user_names_list), 200
   
    except Exception as e:
        return jsonify({"error": str(e)}), 500
