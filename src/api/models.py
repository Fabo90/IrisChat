from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(260), unique=True, nullable=False)
    user_name = db.Column(db.String(260), unique=True, nullable=False)
    password = db.Column(db.String(260), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "user_name": self.user_name,
            # do not serialize the password, its a security breach
        }
    
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    sender = db.relationship('User', foreign_keys=[sender_id])
    receiver = db.relationship('User', foreign_keys=[receiver_id])

    def __repr__(self):
        return f'<Message from {self.sender_id} to {self.receiver_id} at {self.timestamp}>'

    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.serialize(),
            "receiver": self.receiver.serialize(),
            "text": self.text,
            "timestamp": self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User')

    def __repr__(self):
        return f'<Notification {self.id} for User {self.user_id} at {self.timestamp}>'

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user": self.user.serialize(),
            "message": self.message,
            "timestamp": self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }
