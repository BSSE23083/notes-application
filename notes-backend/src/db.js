const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize the client
const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

// Function to save a note
const saveNote = async (userId, title, content) => {
  const command = new PutCommand({
    TableName: "Notes", // Make sure this matches the name you created in AWS Console
    Item: {
      userId: userId,
      noteId: Date.now().toString(),
      title: title,
      content: content,
      createdAt: new Date().toISOString()
    },
  });
  return await docClient.send(command);
};

// Function to get all notes for a user
const getNotes = async (userId) => {
  const command = new ScanCommand({
    TableName: "Notes",
    FilterExpression: "userId = :u",
    ExpressionAttributeValues: { ":u": userId }
  });
  return await docClient.send(command);
};

module.exports = { saveNote, getNotes };