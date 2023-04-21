const express = require('express')
const LearnerData=require('../model/learner')
const userData= require('../model/sitemanagers') // DB of signup
var router = express.Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const bcrypt = require('bcrypt');



const saltRounds = 10; // Number of salt rounds to use for the hash

router.post('/auth', async (req, res) => {
  const loginemail = req.body.email;
  const loginpassword = req.body.password;
  const user = await userData.findOne({ email: loginemail }).exec();
  if (loginemail == 'admin' && loginpassword == '1234') {
            console.log("admin login success");
            res.send({ status: true, data: loginemail });
        }

   else if (user) {
    bcrypt.compare(loginpassword, user.password, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error comparing passwords');
      } else if (result) {
        console.log(user.role);
        console.log('user login success');
        res.send({ status: true, data: user.role });
      } else {
        res.status(401).json({
          status: false,
          message: 'Authentication failed. Invalid password.',
        });
      }
    });
  } else {
    res.status(401).json({
      status: false,
      message: 'Authentication failed. User not found.',
    });
  }
  
  
});



// //login
// router.post('/auth', async (req, res) => {
//   let loginemail = req.body.email;
//   const newpassword = req.body.password;

//   // Generate a salt and hash the password
//   bcrypt.hash(newpassword, 10, async (err, hash) => {
//     if (err) {
//       // Handle the error
//       console.error(err);
//       res.status(500).send('Error hashing password');
//     } else {
//       // Store the hashed password in the loginpassword variable
//       let loginpassword = hash;
//       console.log(loginpassword)

//       // Query the database using the hashed password
//       const user = await userData.findOne({ email: loginemail, password: loginpassword }).exec();
//       if (loginemail == 'admin' && loginpassword == '1234') {
//         console.log("admin login success");
//         res.send({ status: true, data: loginemail });
//       } else if (user) {
//         console.log(user.role);
//         console.log("user login success");
//         res.send({ status: true, data: user.role });
//       } else {
//         res.status(401).json({
//           status: false,
//           message: "Authentication failed. Invalid role."
//         });
//       }
//     }
//   });
// });

//SiteManagers

const staffInfo = require('../model/sitemanagers')

//read staff list 
router.get('/stafflist', async(req,res)=>{
    try {
        const list = await staffInfo.find();
        res.send(list);
    }
    catch(error) {
        console.log(error);
    }
})

// read single staff detail
router.get('/staff/:id',async(req,res)=>{
    try {
        let id = req.params.id;
        let staff = await staffInfo.findById(id);
        res.send(staff);
    }
    catch(error) {
        console.log(error);
    }
})

// add new staff
router.post('/staff', async(req,res)=>{
    try {
        // store the front end entered details in server variable
        console.log(req.body);
        bcrypt.hash(req.body.password, 10, function(err, hash) {
            // store hash in the database
            let staffnew ={
                name: req.body.name,
                email: req.body.email,
                password: hash,
                role : req.body.role
            }

            let staff = new staffInfo(staffnew);
            let saveStaff = staff.save();
            res.send(saveStaff);                              
        });                   
    }
    catch(error) {
        console.log(">>",error);
    }
})

// update staff detail
router.put('/staff/:id', async(req, res) => {
    try {
      let id = req.params.id;
        console.log(id)
        let staff ={
            name: req.body.name,
            email: req.body.email,
            // password: req.body.password,
            role : req.body.role
        }
        let updateStaff = { $set: staff };
        let updateInfo = await staffInfo.findByIdAndUpdate({'_id': id }, updateStaff);
        res.send(updateInfo)
    } catch (error) {
        console.log(error);
    }
})

// delete staff detail
router.delete('/staff/:id', async(req,res)=>{
    try {
        let id = req.params.id;
        let deleteStaff = await staffInfo.deleteOne({'_id':id});
        res.send(deleteStaff);
    }
    catch(error) {
        console.log(error);   
    }
})
//learners
router.get('/',async(req,res)=>{
 
    try {
        
    let learners =  await LearnerData.find()
    res.json({data:learners,message:"success"}).status(200)


    } catch (error) {
        console.log(error)
        res.json({message:error}).status(400)
    }

})

router.post('/',async(req,res)=>{

    try {
        let learner = req.body
        let data = new LearnerData(learner)
        await data.save()
        res.json({ message: 'Data saved successfully' }).status(201)
        
    } catch (error) {
        console.log(error)
     res.json({message:error}).status(400)
        
    }
})

// const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: function (req, file, cb) {
//     if (file.mimetype !== 'text/csv') {
//       return cb(new Error('Only CSV files are allowed'));
//     }
//     cb(null, true);
//   },
// });
// app.post('/upload', upload.single('file'), (req, res) => {
//   const file = req.file;
//   const results = [];
//   fs.createReadStream(file.buffer)
//     .pipe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//       Data.insertMany(results)
//         .then(() => {
//           res.send('File uploaded and saved to database');
//         })
//         .catch((err) => {
//           console.error(err);
//           res.status(500).send('Error saving data to database');
//         });
//     });
// });

router.put('/:id',async(req,res)=>{
  
  try {
    let id = req.params.id;
    let learner=req.body;
    const updatedLearner = await LearnerData.findByIdAndUpdate({_id:id},{$set:learner})
    res.json({message :'Data updated succesfully'}).status(200)
  } catch (error) {
    console.log(error)
    res.json({message:error}).status(400)
  }

})

router.delete('/:id',async(req,res)=>{
  try {

    
    let id = req.params.id
    await LearnerData.findByIdAndDelete({_id:id})
    res.json({message :'Data deleted succesfully'}).status(200)

    
  } catch (error) {
    console.log(error)
    res.json({message:error}).status(400)
    
  }
})


module.exports= router