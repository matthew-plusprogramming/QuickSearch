//  QuickSearch
//
//  Created by Matthew Lin.
//  Contact: matthewlinplusprogramming@gmail.com
//
//  Entrypoint for server, initializes behavior
//
//  Copyright © 2021 Matthew Lin. All rights reserved.
//

// Environment import
import dotenv from 'dotenv';
dotenv.config();

// Regular imports
import cors from 'cors';
import express from 'express';

// REST API
const app = express();
app.use(cors());
app.use(express.json());

// ! REMOVE ME BEFORE PRODUCTION. For development purposes only
app.get('/', (req, res) => {
  console.log('received request');
  console.log(JSON.stringify(req.body));

  res.status(200).send('OK');
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
