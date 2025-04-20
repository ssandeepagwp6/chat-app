import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Unuthorized, no token Provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: 'Unuthorized, Invalid token' });
        }

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Unuthorized, no user found' });
        }

        req.user = user;

        next();

    }
    catch (error) {
        console.log('Error in auth middleware: ', error.message);
        return res.status(500).json({ message: 'Internal Server error' });
    }
};
