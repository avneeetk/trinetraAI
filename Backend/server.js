// Backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
const PORT = 5002;

app.use(cors());
app.use(cors({
  origin: 'http://localhost:8080', 
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

app.post('/api/simulate', (req, res) => {
  const scriptId = req.body.scriptId;

  if (!scriptId) {
    return res.status(400).json({
      status: 'error',
      message: 'scriptId is required'
    });
  }


  console.log(`Simulating execution for scriptId: ${scriptId} on Mac.`);

  setTimeout(() => {
    return res.status(200).json({
      status: 'success',
      delay:500,
      message: `Simulation triggered for ${scriptId} successfully. (Backend simulation only)`,
      scriptId: scriptId
    });
  }, 500); 

});

app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    details: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Simulation API running on http://localhost:${PORT}`);
});

//backend code to run  .bat file
// const { execFile } = require('child_process');
// const path = require('path');
// app.post('/api/simulate', (req, res) => {
//   const scriptId = req.body.scriptId;
  
//   if (!scriptId) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'scriptId is required'
//     });
//   }

//   const scriptPath = path.join(__dirname, 'ransomware_sim.bat');

//   execFile(scriptPath, (error, stdout, stderr) => {
//     if (error) {
//       console.error('Execution error:', error);
//       return res.status(500).json({
//         status: 'error',
//         message: error.message || 'Internal server error',
//         details: stderr
//       });
//     }

//     console.log(`Executed ${scriptId}`);
//     console.log('Output:', stdout);

//     return res.status(200).json({
//       status: 'success',
//       output: stdout,
//       scriptId: scriptId
//     });
//   });
// });

// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
//   res.status(500).json({
//     status: 'error',
//     message: 'Internal server error',
//     details: err.message
//   });
// });


