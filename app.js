const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require("./config.json");
var nodemailer = require('nodemailer');

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var sql = require("mysql");
const multer = require('multer');
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads');
        },
        filename: (req, file, cb) => {
            const name = (file.originalname);
            cb(null, name);
        }
    })
});
var error;
var success;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static("uploads"));
app.set("view engine", "ejs");

var sqlConnection = sql.createConnection({
    host: "34.136.145.159",
    user: "root",
    port: "3306",
    password: "12345678",
    database: "guest_lecture_details",
    multipleStatements: true
});
sqlConnection.connect(function(err) {
    if (!err) {
        console.log("Connected to SQL");
    } else {
        console.log("Connection Failed" + err);
    }
});
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'thepeepaltree2000@gmail.com',
        pass: 'Aswanth3'
    }
});


app.get("/", function(req, res) {
    var errmain = error;
    error = "";
    res.render("login", { errmain: errmain });
});
app.post("/login", async function(req, res) {
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    if (req.body.type === 'Admin') {
        await sqlConnection.query(`select * from admin where username=?`, [username], function(err, rows) {
            if (err) {
                console.log(err);
                error = "Something Went Wrong";
                res.redirect("/");
            } else {
                if (rows.length == 0) {
                    console.log(rows);
                    error = "No users Found";
                    res.status(404).redirect("/");
                } else {
                    if (password === rows[0].password) {
                        res.render("inter", {
                            token: jwt.sign({ role: "admin", username }, config.hasher),
                            role: "admin",
                            user: username
                        })
                    } else {
                        error = "Password Incorrect";
                        res.status(404).redirect("/");


                    }
                }
            }
        })
    } else if (req.body.type === 'Faculty') {
        await sqlConnection.query(`select * from faculty where FID='${username}'`, function(err, rows) {
            if (err) {
                console.log(err);
                error = "Something Went Wrong";
                res.redirect("/");
            } else {
                if (rows.length == 0) {
                    console.log(rows);
                    error = "No users Found";
                    res.redirect("/");
                } else {
                    if (bcrypt.compareSync(password, rows[0].F_password)) {
                        res.render("inter", {
                            token: jwt.sign({ role: "faculty", username }, config.hasher),
                            role: "faculty",
                            user: username
                        })
                    } else {
                        error = "Password Incorrect";
                        res.redirect("/");


                    }
                }
            }
        })


    } else {
        await sqlConnection.query(`select * from student where rollno='${username}'`, function(err, rows) {
            if (err) {
                console.log(err);
                error = "Something Went Wrong";
                res.redirect("/");
            } else {
                if (rows.length == 0) {
                    console.log(rows);
                    error = "No users Found";
                    res.redirect("/");
                } else {
                    if (bcrypt.compareSync(password, rows[0].password)) {
                        res.render("inter", {
                            token: jwt.sign({ role: "student", username }, config.hasher),
                            role: "student",
                            user: username
                        })
                    } else {
                        error = "Password Incorrect";
                        res.redirect("/");


                    }
                }
            }
        })

    }

});
app.get("/student/signup", function(req, res) {
    var errmain = error;
    error = "";
    res.render("student_sign", { errmain: errmain });
})
app.get("/student/:id", async function(req, res) {
    var errmain = error;
    error = "";
    await sqlConnection.query(`Select * from student where rollno='${req.params.id}'`, async function(err, result) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Select * from lecture where C_ID=${result[0].class}`, async function(err1, result1) {
                if (err1) {
                    console.log(err1)
                } else {
                    res.render("stuhome", { stu: result[0], lec: result1, errmain: errmain });

                }
            })

        }
    })

});
app.get("/student/od/:id", async function(req, res) {
    await sqlConnection.query(`Select ods.ODid,ods.rollno,ods.time,ods.Status,lecture.L_Name,class.Class from ods,class,lecture where ods.rollno='${req.params.id}' and lecture.L_ID=ods.LECT and ods.class=class.C_ID`, async function(err, results) {
        if (err) {
            console.log(err)
        } else {
            res.render("ods", { od: results })
        }
    })
})
app.post("/student/od/:id", async function(req, res) {
    await sqlConnection.query(`Select * from ods where rollno='${req.body.rollno}' and LECT=${req.body.LECT}`, async function(err1, res1) {
        if (err1) {
            console.log(err1)
        } else {
            if (res1.length) {
                console.log(res1)
                error = "OD Already Applied"
                res.redirect("/student/" + req.params.id);
            } else {
                await sqlConnection.query(`Insert into ods set ?`, { rollno: req.body.rollno, LECT: req.body.LECT, class: req.body.class, time: req.body.start + "-" + req.body.end, Status: 0 }, async function(err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        error = "OD Request Submitted"
                        res.redirect("/student/" + req.params.id);
                    }
                })

            }
        }
    })

});
app.get("/admin", async function(req, res) {
    await sqlConnection.query(`Select * from lecture where lecture.Status='0' `, async function(err, result) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Select * from faculty `, async function(err1, result1) {
                if (err1) {
                    console.log(err1)
                } else {
                    res.render("adminHome", { pend: result, faculty: result1 })
                }
            })

        }
    })

    // res.render("adminHome");
});
app.get("/admin/func", async function(req, res) {
    await sqlConnection.query(`Select * from lecture where lecture.Status='0' `, async function(error, result2) {
        if (error) {
            console.log(error)
        } else {
            await sqlConnection.query(`Select * from guest`, async function(err, result) {
                if (err) {
                    console.log(err)
                } else {
                    await sqlConnection.query(`Select * from  hall`, async function(err1, result1) {
                        if (err1) {
                            console.log(err1)
                        } else {
                            await sqlConnection.query(`Select * from class`, async function(err3, result3) {
                                if (err3) {
                                    console.log(err3)
                                } else {
                                    res.render("adminGuest", { guest: result, hall: result1, pend: result2, class1: result3 })

                                }
                            })
                        }
                    })
                }
            })

        }
    });


});
app.get("/admin/edit/fac/:id", async function(req, res) {
    await sqlConnection.query(`Select * from lecture where lecture.Status='0' `, async function(err, result) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Select * from faculty `, async function(err1, result1) {
                if (err1) {
                    console.log(err1)
                } else {
                    await sqlConnection.query(`Select * from faculty where FID='${req.params.id}'`, async function(err2, result2) {
                        if (err2) {
                            console.log(err2)
                        } else {
                            res.render("adminFacedit", { pend: result, faculty: result1, fac: result2[0] })
                        }
                    })

                }
            })

        }
    })

});
app.post("/admin/edit/fac/:id", async function(req, res) {
    var FID = req.body.User_name;
    var FName = req.body.first_name + " " + req.body.last_name;
    var Email = req.body.email;
    var DOB = req.body.birthday;
    var Gender = req.body.gender;
    sqlConnection.query(`Update faculty set ? where FID='${FID}'`, { FName, Email, DOB, Gender }, function(err, rows) {
        if (err) {
            console.log(err)
            error = "Please Check Your Username!" + err.sqlMessage;
            res.redirect("/signup")
        } else {
            res.redirect("/")

        }
    })

});
app.post("/admin/add/fac", async function(req, res) {
    console.log(req.body);
    var FID = req.body.User_name;
    var FName = req.body.first_name + " " + req.body.last_name;
    var Email = req.body.email;
    var F_password = await bcrypt.hash(req.body.password, config.salt);
    var DOB = req.body.birthday;
    var Gender = req.body.gender;
    sqlConnection.query(`Insert into faculty set ?`, { FID, FName, Email, F_password, DOB, Gender }, function(err, rows) {
        if (err) {
            console.log(err)
            error = "Please Check Your Username!" + err.sqlMessage;
            res.redirect("/signup")
        } else {
            var mailBody = {
                from: 'thepeepaltree2000@gmail.com',
                to: Email,
                subject: "Welcome to Guest Lecture Scheduler",
                text: `Hello ${FName} We are happy to Have you \n Your New Password: ${req.body.password}`
            }
            transporter.sendMail(mailBody, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    success = "Email Sent!!"
                    res.redirect("/")
                }
            });

        }
    })
})
app.get("/admin/fac/delete/:id", async function(req, res) {
    console.log("Reached ger")
    await sqlConnection.query(`Delete from faculty where FID=?`, [req.params.id], async function(err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/admin")
        }
    })
});
app.post("/admin/guest", async function(req, res) {

    var GName = req.body.GName;
    var GEmail = req.body.GEmail;
    await sqlConnection.query(`Insert into guest set ?`, { GName, GEmail }, function(err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/admin/func");
        }
    })

});
app.get("/admin/guest/delete/:id", async function(req, res) {

    await sqlConnection.query(`Delete from guest where G_ID=${req.params.id}`, function(err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/admin/func")
        }
    })
})
app.get("/admin/hall/delete/:id", async function(req, res) {

    await sqlConnection.query(`Delete from hall where H_ID=${req.params.id}`, function(err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/admin/func")
        }
    })
})
app.post("/admin/class", async function(req, res) {

    var Class = req.body.Class;
    var CLink = req.body.CLink;
    await sqlConnection.query(`Insert into class set ?`, { Class, CLink }, function(err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/admin/func");
        }
    })

})
app.get("/admin/class/delete/:id", async function(req, res) {

    await sqlConnection.query(`Delete from class where C_ID=${req.params.id}`, function(err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/admin/func")
        }
    })
})
app.post("/admin/hall", async function(req, res) {

    var HName = req.body.HName;
    var Link = req.body.Link;
    await sqlConnection.query(`Insert into hall set ?`, { HName, Link }, function(err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/admin/func");
        }
    })

})
app.get("/faculty", async function(req, res) {
    var succcessLocal = success;
    success = ""
    await sqlConnection.query(`Select * from guest`, async function(err, rows) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Select * from hall`, async function(err1, result) {
                if (err1) {
                    console.log(err1)
                } else {
                    await sqlConnection.query(`Select * from class`, async function(err2, result2) {
                        if (err2) {
                            console.log(err1)
                        } else {
                            res.render("fachome", { guest: rows, hall: result, class1: result2, success: succcessLocal });
                        }
                    })


                }
            })

        }
    })

})
app.get("/invite", async function(req, res) {

    await sqlConnection.query(`Select * from guest `, function(err, rows) {
        if (err) {
            console.log(err)
        } else {
            res.render("confirmLecturePage", { guest: rows })
        }
    })


});
app.get("/request", async function(req, res) {
    await sqlConnection.query(`Select lecture.L_ID,lecture.L_Name,lecture.Topic,lecture.Details,lecture.Status,lecture.Slot,hall.H_ID,hall.HName,hall.Link,class.Class,class.CLink from lecture,hall,class where lecture.Status='0' and lecture.H_ID=hall.H_ID and class.C_ID=lecture.C_ID `, async function(err, result) {
        if (err) {
            console.log(err)
        } else {

            await sqlConnection.query(`Select * from lecture where lecture.Status='0' `, async function(err1, result1) {
                if (err1) {
                    console.log(err1)
                } else {
                    res.render("approveRequest", { request: result, pend: result1 })
                }
            })

        }
    })

})
app.get("/signup", function(req, res) {
    var errmain = error;
    error = "";
    res.render("teacher_login", { errmain: errmain })
});

app.post("/student/signup", async function(req, res) {
    console.log(req.body);
    var rollno = req.body.User_name;
    var Name = req.body.first_name + " " + req.body.last_name;
    var email = req.body.email;
    var dob = req.body.birthday;
    var gender = req.body.gender === 'on' ? 'Male' : 'Female';
    var password = await bcrypt.hash(req.body.password, config.salt);
    await sqlConnection.query(`Insert into student set ?`, { rollno, Name, email, dob, gender, password }, async function(err, rows) {
        if (err) {
            console.log(err)
            error = "Please Check Your Username!" + err.sqlMessage;
            res.redirect("/student/signup")

        } else {
            var mailBody = {
                from: 'thepeepaltree2000@gmail.com',
                to: email,
                subject: "Welcome to Guest Lecture Scheduler",
                text: `Hello ${Name} We are happy to Have you`
            }
            transporter.sendMail(mailBody, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    success = "Email Sent!!"
                    res.redirect("/student/update/" + rollno);

                }
            });

        }
    })
});
app.get("/student/update/:id", async function(req, res) {
    await sqlConnection.query(`Select * from class`, async function(err, results) {
        if (err) {
            console.log(err)
        } else {
            res.render("studentClass", { user: req.params.id, class1: results })
        }

    })

});
app.post("/student/update/:id", upload.single('photo'), async function(req, res) {
    console.log(req.body)
    var pro_pic = "/" + req.file.destination + "/" + req.file.filename;

    await sqlConnection.query(`Update student set ? where rollno='${req.body.user_name}'`, { class: req.body.class, pro_pic }, async function(err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/student/" + req.body.user_name)
        }

    })


})
app.post("/signup", async function(req, res) {
    console.log(req.body);
    var FID = req.body.User_name;
    var FName = req.body.first_name + " " + req.body.last_name;
    var Email = req.body.email;
    var F_password = await bcrypt.hash(req.body.password, config.salt);
    var DOB = req.body.birthday;
    var Gender = req.body.gender === 'on' ? 'Male' : 'Female';
    sqlConnection.query(`Insert into faculty set ?`, { FID, FName, Email, F_password, DOB, Gender }, function(err, rows) {
        if (err) {
            console.log(err)
            error = "Please Check Your Username!" + err.sqlMessage;
            res.redirect("/signup")
        } else {
            var mailBody = {
                from: 'thepeepaltree2000@gmail.com',
                to: Email,
                subject: "Welcome to Guest Lecture Scheduler",
                text: `Hello ${FName} We are happy to Have you`
            }
            transporter.sendMail(mailBody, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    success = "Email Sent!!"
                    res.redirect("/")
                }
            });

        }
    })
});
app.get("/student/volunteer/:id", async function(req, res) {
    await sqlConnection.query(`Select volunteer.VID,volunteer.SID,lecture.L_Name,lecture.Slot from lecture,volunteer where volunteer.SID='${req.params.id}' and volunteer.LID=lecture.L_ID`, async function(err, results) {
        if (err) {
            console.log(err)
        } else {
            res.render("volunteerDetails", { volun: results })
        }
    })
})
app.post("/schedule", async function(req, res) {
    console.log(req.body);
    var L_Name = req.body.L_Name;
    var Topic = req.body.Topic;
    var Details = req.body.Details;
    var Slot = req.body.date + " " + req.body.stime + " - " + req.body.etime;
    var F_ID = req.body.F_ID;
    var G_ID = req.body.guest;
    var Status = 0;
    var H_ID = req.body.Room;
    var C_ID = req.body.course;

    await sqlConnection.query(`Insert into lecture set ?`, { L_Name, Topic, Details, Slot, F_ID, G_ID, Status, H_ID, C_ID }, async function(err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/faculty")
        }
    })
});
app.get("/lecture/edit/:id", async function(req, res) {

    await sqlConnection.query(`Select * from guest`, async function(err, rows) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Select * from hall`, async function(err1, result) {
                    if (err1) {
                        console.log(err1)
                    } else {
                        await sqlConnection.query(`Select * from lecture where L_ID='${req.params.id}'`, async function(err2, results) {
                            if (err2) {
                                console.log(err2)
                            } else {
                                await sqlConnection.query(`Select * from class`, async function(err3, result1) {
                                    if (err3) {
                                        console.log(err3)
                                    } else {
                                        res.render("lecEdit", { lecture: results[0], guest: rows, hall: result, class1: result1 })
                                    }
                                })

                            }
                        })

                    }
                })
                // res.render("fachome", { guest: rows });
        }
    })



})
app.post("/lecture/edit/:id", async function(req, res) {
    console.log(req.body);
    var L_Name = req.body.L_Name;
    var Topic = req.body.Topic;
    var Details = req.body.Details;
    var Slot = req.body.date + " " + req.body.stime + " - " + req.body.etime;
    var F_ID = req.body.F_ID;
    var G_ID = req.body.guest;
    var Status = 0;
    var H_ID = req.body.Room;
    var C_ID = req.body.course;

    await sqlConnection.query(`Update lecture set ? where L_ID=${req.params.id}`, { L_Name, Topic, Details, Slot, F_ID, G_ID, Status, H_ID, C_ID }, async function(err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/faculty")
        }
    })

})
app.get("/lecture/accept/:id", async function(req, res) {
    var Status = 1;

    await sqlConnection.query(`Update lecture set ? where L_ID='${req.params.id}'`, { Status }, function(err, results) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/request")
        }
    })

})
app.post("/lecture/reject/:id", async function(req, res) {
    var Status = -1;
    var Remarks = req.body.Remarks
    await sqlConnection.query(`Update lecture set ? where L_ID='${req.params.id}'`, { Status, Remarks }, function(err, results) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/request")
        }
    })

})
app.get("/lecture/:id", async function(req, res) {
    await sqlConnection.query(`Select lecture.L_ID,lecture.L_Name,lecture.Topic,lecture.Details,lecture.Status,lecture.Slot,hall.H_ID,hall.HName,hall.Link,class.Class,class.CLink from lecture,hall,class where lecture.Status='0' and lecture.H_ID=hall.H_ID and class.C_ID=lecture.C_ID and lecture.F_ID='${req.params.id}'`, async function(err, result) {
        if (err) {
            console.log(err)
        } else {

            await sqlConnection.query(`Select lecture.L_ID,lecture.L_Name,lecture.Topic,lecture.Details,lecture.Status,lecture.Slot,hall.H_ID,hall.HName,hall.Link,class.Class,class.CLink from lecture,hall,class where lecture.Status='1' and lecture.H_ID=hall.H_ID and class.C_ID=lecture.C_ID and lecture.F_ID='${req.params.id}'`, async function(err1, result1) {
                if (err1) {
                    console.log(err1)
                } else {

                    await sqlConnection.query(`Select lecture.L_ID,lecture.L_Name,lecture.Topic,lecture.Details,lecture.Remarks,lecture.Status,lecture.Slot,hall.H_ID,hall.HName,hall.Link,class.Class,class.CLink from lecture,hall,class where lecture.Status='-1' and lecture.H_ID=hall.H_ID and class.C_ID=lecture.C_ID and lecture.F_ID='${req.params.id}'`, function(err2, result2) {
                        if (err2) {
                            console.log(err2)
                        } else {

                            res.render("pendRequests", { pendRequest: result, acceptRequest: result1, rejectRequest: result2 })
                        }
                    })

                }
            })

        }
    })

});

app.get("/lecture/view/:id", async function(req, res) {
    await sqlConnection.query(`Select lecture.L_ID,lecture.L_Name,lecture.Topic,lecture.Details,lecture.Resource,lecture.Status,lecture.Slot,hall.HName,hall.Link,faculty.FName,guest.GName,class.Class,class.CLink from lecture,hall,faculty,guest,class where lecture.L_ID=${req.params.id} and lecture.H_ID=hall.H_ID and lecture.F_ID=faculty.FID and lecture.G_ID=guest.G_ID and lecture.C_ID=class.C_ID`, async function(err, results) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Select volunteer.VID,volunteer.SID,student.Name,class.Class from volunteer,student,class where volunteer.LID='${req.params.id}' and volunteer.SID=student.rollno and student.class=class.C_ID`, async function(err1, results1) {
                if (err1) {
                    console.log(err1)
                } else {

                    res.render("lecture", { lec: results[0], volun: results1 })

                }
            })
        }
    })

});
app.get("/lecture/student-view/:id", async function(req, res) {
    await sqlConnection.query(`Select lecture.L_ID,lecture.L_Name,lecture.Topic,lecture.Details,lecture.Resource,lecture.Status,lecture.Slot,hall.HName,hall.Link,faculty.FName,guest.GName,class.Class,class.CLink from lecture,hall,faculty,guest,class where lecture.L_ID=${req.params.id} and lecture.H_ID=hall.H_ID and lecture.F_ID=faculty.FID and lecture.G_ID=guest.G_ID and lecture.C_ID=class.C_ID`, async function(err, results) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Select volunteer.VID,volunteer.SID,student.Name,class.Class from volunteer,student,class where volunteer.LID='${req.params.id}' and volunteer.SID=student.rollno and student.class=class.C_ID`, async function(err1, results1) {
                if (err1) {
                    console.log(err1)
                } else {

                    res.render("lecturestudent", { lec: results[0], volun: results1 })

                }
            })
        }
    })

});
app.post("/lecture/upload/:id", upload.single("resource"), async function(req, res) {
    var Resource = "/" + req.file.destination + "/" + req.file.filename;
    await sqlConnection.query(`Update lecture set ? where L_ID=${req.params.id} `, { Resource }, async function(err, result) {
        if (err) {
            console.log(err)
        } else {
            console.log("uploaded")
            res.redirect("/lecture/view/" + req.params.id)
        }
    })

});
app.get("/uploads/:id", async function(req, res) {
    const file = `${__dirname}/uploads/${req.params.id}`;
    res.download(file);
})

app.get("/lecture/volunteer/:id", async function(req, res) {
    await sqlConnection.query(`Select student.rollno,student.Name,student.email,student.dob,student.gender,class.Class from student,class where student.class=class.C_ID `, async function(err, resutlt) {
        if (err) {
            console.log(err)
        } else {
            // console.log(resutlt)
            await sqlConnection.query(`Select * from class`, async function(err1, result1) {
                if (err1) {
                    console.log(err1)
                } else {
                    res.render("volunteer", { stu: resutlt, class1: result1 })

                }
            })

        }
    })

});
app.post("/lecture/volunteer/:id", async function(req, res) {
    console.log("reached")
    var vol = []
    var vol = req.body.volunteer
    if (typeof vol === "string") {
        await sqlConnection.query(`Insert into volunteer set ?`, { SID: vol, LID: req.params.id }, function(err, result) {

            if (err) {
                console.log(err)
            } else {
                res.redirect("/lecture/view/" + req.params.id)
            }
        })
    } else {
        var fl = 0
        for (var i = 0; i < vol.length; i++) {
            await sqlConnection.query(`Insert into volunteer set ?`, { SID: vol[i], LID: req.params.id }, function(err, result) {

                if (err) {
                    console.log(err)
                    fl = 1
                }
            })

        }
        if (fl) res.redirect("/lecture/volunteer/" + req.params.id);
        else res.redirect("/lecture/view/" + req.params.id);
    }
});
app.post("/lecture/volunteer/filter/:id", async function(req, res) {
    var class1 = req.body.class;
    var rollno = req.body.rollno;
    var classes;
    await sqlConnection.query(`Select * from class`, function(err1, result1) {
        if (err1) {
            console.log(err1)
        } else {
            classes = result1;
        }
    })
    if (class1 == '0' && rollno == '') {
        res.redirect("/lecture/volunteer/" + req.params.id);
    } else if (class1 != '0') {
        class1 = parseInt(class1)
        await sqlConnection.query(`Select * from student where class=${class1}`, async function(err, result) {
            if (err) {
                console.log(err)
            } else {
                res.render("volunteer", { stu: result, class1: classes })
            }
        })
    } else {
        await sqlConnection.query(`Select * from student where rollno='${rollno}'`, async function(err, result) {
            if (err) {
                console.log(err)
            } else {
                res.render("volunteer", { stu: result, class1: classes })
            }
        })

    }
    console.log(req.body);
});
app.get("/lecture/od/:id", async function(req, res) {
    await sqlConnection.query(`Select ods.ODid,ods.time,ods.rollno,class.Class from ods,class where ods.LECT=${req.params.id} and ods.class=class.C_ID and ods.Status=0`, async function(err, results) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Select ods.ODid,ods.time,ods.rollno,class.Class from ods,class where ods.LECT=${req.params.id} and ods.class=class.C_ID and ods.Status=1`, async function(err1, results1) {
                if (err1) {
                    console.log(err1)
                } else {
                    console.log(results)
                    console.log("results 2")
                    console.log(results1)
                    res.render("approveod", { stu1: results, stu2: results1 })
                }
            })
        }
    })
});
app.post("/lecture/od/:id", async function(req, res) {
    console.log("reached")
    var vol = []
    var vol = req.body.volunteer
    if (typeof vol === "string") {
        await sqlConnection.query(`update ods set ? where rollno='${vol}' and LECT=${req.params.id}`, { Status: 1 }, function(err, result) {

            if (err) {
                console.log(err)
            } else {
                res.redirect("/lecture/od/" + req.params.id);
            }
        })
    } else {
        var fl = 0
        for (var i = 0; i < vol.length; i++) {
            await sqlConnection.query(`update ods set ? where rollno='${vol[i]}' and LECT=${req.params.id}`, { Status: 1 }, function(err, result) {

                if (err) {
                    console.log(err)
                    fl = 1
                }
            })

        }
        if (fl) res.send("Error");
        else res.redirect("/lecture/od/" + req.params.id);
    }
})
app.post("/inviteguest", function(req, res) {
    var mailBody = {
        from: 'thepeepaltree2000@gmail.com',
        to: req.body.email,
        subject: req.body.subject,
        text: req.body.message
    }
    transporter.sendMail(mailBody, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            success = "Email Sent!!"
            res.redirect("/")
        }
    });


});

app.get("/rooms", function(req, res) {
    res.render("roombooking", { rooms: null, date: null, guest: null })
})
app.post("/room/get", async function(req, res) {
    var date = req.body.date;
    console.log(date)
    await sqlConnection.query(`Select * from room where booked!='${date}' or booked is NULL`, async function(err, results) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Select * from guest`, async function(err1, result1) {
                if (err1) {
                    console.log(err1)
                } else {
                    res.render("roombooking", { rooms: results, date: date, guest: result1 })

                }
            })
        }
    })

});
app.post("/transport", async function(req, res) {
    console.log(req.body);
    await sqlConnection.query(`Update room set ? where roomno=${req.body.roomno}`, { booked: req.body.date, bookby: req.body.bookby, bookfor: req.body.guest }, async function(err, results) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Insert into transport set ?`, { gID: req.body.guest, pickdate: req.body.pickdate, picktime: req.body.pickup, facID: req.body.bookby }, async function(err1, results1) {
                if (err1) {
                    console.log(err1)
                } else {
                    res.redirect("/bookings/" + req.body.bookby);
                }
            })
        }
    })

});


app.get("/bookings/:id", async function(req, res) {

    await sqlConnection.query(`Select room.roomno,room.description,room.booked,guest.GName from room,guest where room.bookby='${req.params.id}' and room.bookfor=guest.G_ID`, async function(err, results) {
        if (err) {
            console.log(err)
        } else {
            await sqlConnection.query(`Select transport.TID,transport.pickdate,transport.picktime,guest.GName from transport,guest where transport.facID='${req.params.id}' and transport.gID=guest.G_ID`, async function(err1, results1) {
                if (err1) {
                    console.log(err1)
                } else {
                    res.render("bookings", { rooms: results, trans: results1 })
                }
            })
        }
    })
});

app.get("/forgot", async function(req, res) {
    var errmain = error;
    error = "";
    res.render("forgot", { errmain: errmain });
});
app.post("/forgot", async function(req, res) {
    var username = req.body.username;
    if (req.body.type === 'Admin') {
        console.log("Admin")
        error = "No users Found";
        res.redirect("/forgot");
    } else {
        if (req.body.type === 'Faculty') {
            await sqlConnection.query(`select * from faculty where FID='${username}'`, function(err, rows) {
                if (err) {
                    console.log(err);
                    error = "Something Went Wrong";
                    res.redirect("/");
                } else {
                    if (rows.length == 0) {
                        console.log(rows);
                        error = "No users Found";
                        res.redirect("/forgot");
                    } else {
                        var num = Math.floor(Math.random() * 10000);
                        var mailBody = {
                            from: 'thepeepaltree2000@gmail.com',
                            to: rows[0].Email,
                            subject: "Password Reset Email",
                            text: "Your OTP for Password Reset : " + num
                        }
                        transporter.sendMail(mailBody, function(error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                success = "Email Sent!!"
                                res.render("forgot1", { num: num, username: username })
                            }
                        });


                    }
                }
            })
        } else {
            await sqlConnection.query(`select * from student where rollno='${username}'`, function(err, rows) {
                if (err) {
                    console.log(err);
                    error = "Something Went Wrong";
                    res.redirect("/");
                } else {
                    if (rows.length == 0) {
                        console.log(rows);
                        error = "No users Found";
                        res.redirect("/forgot");
                    } else {
                        var num = Math.floor(Math.random() * 10000);
                        var mailBody = {
                            from: 'thepeepaltree2000@gmail.com',
                            to: rows[0].email,
                            subject: "Password Reset Email",
                            text: "Your OTP for Password Reset : " + num
                        }
                        transporter.sendMail(mailBody, function(error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                success = "Email Sent!!"
                                res.render("forgot1", { num: num, username: username })
                            }
                        });


                    }
                }
            })

        }


    }

});

app.post("/reset", async function(req, res) {
    if (req.body.type === 'Faculty') {
        var FID = req.body.username;
        var F_password = await bcrypt.hash(req.body.password, config.salt);
        await sqlConnection.query(`Update faculty set ? where FID='${FID}'`, { F_password }, async function(err, results) {
            if (err) {
                console.log(err)
            } else {
                res.redirect("/");
            }
        })
    } else {
        var rollno = req.body.username;
        var password = await bcrypt.hash(req.body.password, config.salt);
        await sqlConnection.query(`Update student set ? where rollno='${rollno}'`, { password }, async function(err, results) {
            if (err) {
                console.log(err)
            } else {
                res.redirect("/");
            }
        })


    }


})

async function updateRoom() {
    var nu = null;
    var today = new Date();
    today = new Date(today)
    console.log("Today " + today)
    await sqlConnection.query(`Select * from room`, async function(err, results) {
        if (err) {
            console.log(err)
        } else {
            for (var i = 0; i < results.length; i++) {
                if (results[i].booked) {
                    if (new Date(results[i].booked) < today) {
                        await sqlConnection.query(`Update room set ? where room.roomno=${results[i].roomno}`, { booked: nu, bookby: nu, bookfor: nu, lec: nu })
                    }
                }
            }

        }
    })

}

module.exports = app.listen(process.env.PORT || 3000, function() {
    console.log("Server Running at 3000");
    updateRoom();
});