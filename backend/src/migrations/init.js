const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

async function up() {
  const queryInterface = sequelize.getQueryInterface();

  // Create users table
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    profile_image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    auth_provider: {
      type: DataTypes.STRING(20),
      defaultValue: 'email'
    },
    auth_provider_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  // Create user_profiles table
  await queryInterface.createTable('user_profiles', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    website_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    expertise: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Create token_balances table
  await queryInterface.createTable('token_balances', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      unique: true
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Create posts table
  await queryInterface.createTable('posts', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    left_rating_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    right_rating_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    weighted_consensus: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    original_post_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    is_reshare: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  // Create post_media table
  await queryInterface.createTable('post_media', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    media_type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    media_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    thumbnail_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Create post_ratings table
  await queryInterface.createTable('post_ratings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    rating: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_rewarded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reward_amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    uniqueKeys: {
      post_user_unique: {
        fields: ['post_id', 'user_id']
      }
    }
  });

  // Create post_likes table
  await queryInterface.createTable('post_likes', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    token_transaction_id: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    uniqueKeys: {
      post_user_like_unique: {
        fields: ['post_id', 'user_id']
      }
    }
  });

  // Create token_transactions table
  await queryInterface.createTable('token_transactions', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    transaction_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    reference_type: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    transaction_status: {
      type: DataTypes.STRING(20),
      defaultValue: 'completed'
    },
    transaction_hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  });

  // Add foreign key constraint for post_likes.token_transaction_id
  await queryInterface.addConstraint('post_likes', {
    fields: ['token_transaction_id'],
    type: 'foreign key',
    name: 'fk_post_likes_token_transaction',
    references: {
      table: 'token_transactions',
      field: 'id'
    },
    onDelete: 'SET NULL'
  });

  // Create indexes
  await queryInterface.addIndex('users', ['email']);
  await queryInterface.addIndex('users', ['username']);
  await queryInterface.addIndex('posts', ['user_id']);
  await queryInterface.addIndex('posts', ['created_at']);
  await queryInterface.addIndex('post_ratings', ['post_id']);
  await queryInterface.addIndex('post_ratings', ['user_id']);
  await queryInterface.addIndex('post_likes', ['post_id']);
  await queryInterface.addIndex('post_likes', ['user_id']);
  await queryInterface.addIndex('token_transactions', ['user_id']);
  await queryInterface.addIndex('token_transactions', ['transaction_type']);
  await queryInterface.addIndex('token_transactions', ['created_at']);
}

async function down() {
  const queryInterface = sequelize.getQueryInterface();
  
  // Drop tables in reverse order
  await queryInterface.dropTable('post_likes');
  await queryInterface.dropTable('token_transactions');
  await queryInterface.dropTable('post_ratings');
  await queryInterface.dropTable('post_media');
  await queryInterface.dropTable('posts');
  await queryInterface.dropTable('token_balances');
  await queryInterface.dropTable('user_profiles');
  await queryInterface.dropTable('users');
}

module.exports = { up, down };
