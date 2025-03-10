const express = require("express");
const app = express();
/*
   "title" : "mern",
   "cost" : "5000"  
 }*/
app.use(express.json());

let ADMIN = [];
let COURSE = [];
let USER = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const admin = ADMIN.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    next();
  } else {
    res.status(403).json({ message: "Admin Authentication failed" });
  }
};

const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USER.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(403).json({ message: "User Authentication Failed" });
  }
};

app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const existingAdmin = ADMIN.find((a) => a.username === admin.username);
  if (existingAdmin) {
    res.status(403).json({ message: "Admin already exists" });
  } else {
    ADMIN.push(admin);
    res.json({ message: "admin created successfully" });
  }
});

app.post("/admin/login", adminAuthentication, (req, res) => {
  res.json({ message: "Logged in  Successfully" });
});

app.post("/admin/courses", adminAuthentication, (req, res) => {
  const course = req.body;
  course.id = Date.now();
  COURSE.push(course);
  res.json({ message: "course created successfully", courseID: course.id });
});

app.put("/admin/courses/:courseID", adminAuthentication, (req, res) => {
  const courseID = parseInt(req.params.courseID);
  const course = COURSE.find((c) => c.id === courseID);
  if (course) {
    Object.assign(course, req.body);
    res.json({ message: " course updated successfullly" });
  } else {
    res.status(403).json({ message: "course not updated" });
  }
});

app.get("/admin/course", adminAuthentication, (req, res) => {
  res.json({ courses: COURSE });
});

/*user signup , login , purchase courses ,get list of courses , get purchased courses*/

app.post("/user/signup", (req, res) => {
  const user = { ...req.body, purchasedcourses: [] };
  USER.push(user);
  res.json({ message: "user siggned up Successfully" });
});

app.post("/user/login", userAuthentication, (req, res) => {
  res.json({ message: "User logged in Successfully" });
});

app.get("/user/courses", userAuthentication, (req, res) => {
  let filteredcourses = [];
  for (i = 0; i < COURSE.length; i++) {
    if (COURSE[i].published) {
      filteredcourses.push(COURSE[i]);
    }
  }
  res.json({ course: filteredcourses });
});

app.post("/user/courses/courseid", userAuthentication, (req, res) => {
  const courseid = number(req.params.courseid);
  const course = COURSE.find((c) => c.id === courseid && c.published);
  if (course) {
    req.user.purchasedcourses.push(courseid);
    res.json({ message: "Courses purchased Successfully" });
  } else {
    res.status(403).json({ message: "Courses are failed to Purchased" });
  }
});

app.get("/user/purchasedcourses", userAuthentication, (req, res) => {
  const purchasedcourses = COURSE.filter((c) =>
    req.user.purchasedcourses.includes(c.id)
  );
  res.json({ purchasedcourses });
});

/*app.listen(3000, () => {
  console.log("Server is running on port 3000");
});*/
