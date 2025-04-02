from datetime import datetime
from app import db

class TokenTransaction(db.Model):
    __tablename__ = 'token_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(50), nullable=False)  # credit, debit, like, etc.
    description = db.Column(db.Text)
    reference_id = db.Column(db.Integer)  # Can reference post_id, user_id, etc. depending on transaction type
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'transaction_type': self.transaction_type,
            'description': self.description,
            'reference_id': self.reference_id,
            'created_at': self.created_at.isoformat()
        }
