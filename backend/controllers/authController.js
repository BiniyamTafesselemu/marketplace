const jwt = require('jsonwebtoken');


const generateTooken = (users) =>{
    return jwt.sign({
        id: users.id,
        role: users.role,

    },
    process.env.JWT_SECRET,
    {expiresIn: '1d'}
)
}

const googleCallback = (req, res)=>{
    const token = generateTooken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
}

module.exports = { googleCallback };
