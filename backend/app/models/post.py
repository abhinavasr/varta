from datetime import datetime
from app import db

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_reshare = db.Column(db.Boolean, default=False)
    original_post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=True)
    is_published = db.Column(db.Boolean, default=True)
    view_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    media = db.relationship('PostMedia', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    likes = db.relationship('PostLike', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    ratings = db.relationship('PostRating', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    original_post = db.relationship('Post', remote_side=[id], backref='reshares')
    
    def to_dict(self, include_user=False):
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'is_reshare': self.is_reshare,
            'original_post_id': self.original_post_id,
            'is_published': self.is_published,
            'view_count': self.view_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'like_count': self.likes.count(),
            'media': [media.to_dict() for media in self.media]
        }
        
        if include_user:
            result['author'] = self.author.to_dict()
            
        return result
