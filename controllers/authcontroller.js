const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
    try {
        let { fullname, email, password } = req.body;

        let user = await userModel.findOne({ email: email });
        if (user) return res.status(401).send("tuhada account pehlo da hega aw");

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) return res.send(err.message);
                else {
                    let user = await userModel.create({
                        fullname,
                        email,
                        password: hash,
                    });

                    let token = generateToken(user);
                    res.cookie("token", token);
                    res.redirect("/shop");
                }
            });
        });


    }
    catch (err) {
        res.send(err.message);
    }
};

module.exports.loginUser = async function (req, res) {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email: email });
    if(!user) return res.send("Arey Gadhe glt hai tu");

    bcrypt.compare(password,user.password,function(err,result){
        if(result){
            let token=generateToken(user);
            res.cookie("token",token);
            res.redirect("/shop");
        }
    })
}
module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        console.log(email);
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).send({ success: false, msg: "This email does not exist." });

        const token = randomString.generate();
        await userModel.updateOne({ email: email }, { $set: { token } });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            html: `<p>Click on the link to reset your password: <a href="http://127.0.0.1:3000/reset-password?token=${token}">Reset Password</a></p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send({ success: true, msg: "Please check your mail and reset your password." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, msg: error.message });
    }
};


module.exports.resetPassword = async (req, res) => {
    let { token, newPassword } = req.body;

    try {
        const user = await userModel.findOne({ token });
        if (!user) return res.status(400).send({ success: false, msg: "Invalid or expired token." });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        const userNew=await userModel.findOneAndUpdate({ token }, { $set: { password: hash, token: null } },{new:true});

        res.status(200).send({ success: true, msg: "Password has been reset successfully.",data:userNew });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, msg: error.message });
    }
};
module.exports.logout = function (req, res) {
    res.cookie("token", "");
    res.redirect("/");
  };
