const sql = require('mssql');

// Database configuration
const dbConfig = {
  user: 'sa',      // Update with your SQL Server username
  password: '12345',  // Update with your SQL Server password
  server: 'LAPTOP-T0O1J2II',        // SQL Server address (use your SQL Server instance name)
  database: 'ClassroomDB',    // Database we created in our SQL script
  options: {
    encrypt: true,            // Use this if you're on Windows Azure
    trustServerCertificate: true, // Change to false for production
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Create a connection pool
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

// Handle pool errors
poolConnect.catch(err => {
  console.error('SQL Server connection error:', err);
});

// Export the pool for use in other modules
module.exports = {
  sql,
  pool,
  poolConnect
};
