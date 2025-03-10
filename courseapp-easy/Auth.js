const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

let ADMINS = [];
let COURSES = [];
let USERS = [];

const secretKey = "anu1006S3crt1";

const generateJWT = (user) => {
  const payload = { username: user.username };
  return jwt.sign(payload, secretKey, { expiresIn: "1hr" });
};

const Authenticatejwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("")[1];
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

/*ADMINS*/

app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const existingadmin = ADMINS.find((a) => a.username === admin.username);
  if (existingadmin) {
    res.status(403).json({ message: "Admin Already exist" });
  } else {
    ADMINS.push(admin);
    const token = generateJWT(admin);
    res.json({ message: "Admin Successfully Signed in", token });
  }
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    const token = generateJWT(admin);
    res.json({ message: "Admin logged in Successfully", token });
  } else {
    res.status(403).json({ message: "Authentication failed" });
  }
});

app.post("/admin/courses", Authenticatejwt, (req, res) => {
  const course = req.body;
  const courseid = COURSES.length + 1;
  COURSES.push(course);
  res.json({ message: " Course Created Successfully", courseID: courseid });
});

app.put("/admin/courses/courseid", Authenticatejwt, (req, res) => {
  const courseid = parseInt(req.params.courseID);
  const courseindex = COURSES.findIndex((c) => c.id === courseid);
  if (courseindex > -1) {
    const updatedcourse = { ...COURSES[courseindex], ...req.body };
    COURSES[courseindex] = updatedcourse;
    res.json({ message: "Courses Updated Successfully" });
  } else {
    res.status(404).json({ message: "Course not Updated" });
  }
});

app.get("/admin/course", Authenticatejwt, (req, res) => {
  res.json({ courses: COURSES });
});

/*USERS login signup coursespurchased */

app.post("/user/signup", (req, res) => {
  const user = req.body;
  const existinguser = USERS.find((u) => u.username === user.username);
  if (existinguser) {
    res.status(403).send({ message: "User Already exist" });
  }
  USERS.push(user);
  const token = generateJWT(user);
  res.json({ message: "User signned up successfully", token });
});

app.post("/user/login", (req, res) => {
  const { username, password } = req.headers;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    const token = generateJWT(user);
    res.json({ message: "User Logged in Suuccessfully", token });
  } else {
    res.status(403).json({ message: "Authentication failed" });
  }
});

app.get("/user/courses", Authenticatejwt, (req, res) => {
  res.json({ courses: COURSES });
});

app.post("/user/courses/:courseid", Authenticatejwt, (req, res) => {
  const courseid = parseInt(req.params.courseid);
  const course = COURSES.find((c) => c.id === courseid);
  if (course) {
    const user = USERS.find((u) => u.username === req.user.username);
    if (user) {
      if (!user.purchasedcourses) {
        user.purchasedcourses = [];
      }
      user.purchasedcourses.push(course);
      res.json({ message: "courses purchased Successfully" });
    } else {
      res.status(403).json({ message: "user not found" });
    }
    res.status(404).json({ message: "courses not found" });
  }
});

app.get("/user/purchasedcourses", Authenticatejwt, (req, res) => {
  const user = USERS.find((u) => u.username === req.user.username);
  if (user && purchasedcourses) {
    res.json({ purchasedcourses: user.purchasedcourses });
  }
  res.status(404).json({ message: "No courses purchased" });
});

/*app.listen(3000, () => {
  console.log("Server is running on port 3000");
});*/
