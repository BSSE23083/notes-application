// notes-backend/src/models/AuthModel.js
const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

class AuthModel {
  constructor(db) {
    // We pass the docClient (db) from the controller
    this.db = db;
    this.tableName = "Users";
  }

  /**
   * Creates a new user in the DynamoDB 'Users' table
   *
   */
  async createUser(userData) {
    const params = {
      TableName: this.tableName,
      Item: {
        email: userData.email,      // Partition Key
        password: userData.password, // Hashed password from controller
        userId: userData.userId,
        createdAt: new Date().toISOString(),
      },
      // Ensures we don't overwrite an existing user with the same email
      ConditionExpression: "attribute_not_exists(email)",
    };

    try {
      await this.db.send(new PutCommand(params));
      return params.Item;
    } catch (error) {
      if (error.name === "ConditionalCheckFailedException") {
        throw new Error("UserAlreadyExists");
      }
      throw error;
    }
  }

  /**
   * Retrieves a user by their email (Partition Key)
   *
   */
  async findUserByEmail(email) {
    const params = {
      TableName: this.tableName,
      Key: {
        email: email,
      },
    };

    try {
      const response = await this.db.send(new GetCommand(params));
      return response.Item; // Returns undefined if user not found
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks if a user exists
   */
  async userExists(email) {
    const user = await this.findUserByEmail(email);
    return !!user;
  }
}

module.exports = AuthModel;