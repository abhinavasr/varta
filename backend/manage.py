import os
import sys
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import create_app, db

app = create_app()
manager = Manager(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Add Flask-Migrate commands to manager
manager.add_command('db', MigrateCommand)

if __name__ == '__main__':
    manager.run()
