import express from "express";
import cors from "cors";
import UserRoute from "./src/routes/UserRoute.js"
import PostRoute from "./src/routes/PostRoute.js"
import FollowRoute from "./src/routes/FollowRoute.js"
import CommentRoute from "./src/routes/CommentRoute.js"
import LikeRoute from "./src/routes/LikeRoute.js"
import ImageRoute from "./src/routes/ImageRoute.js"
import multer from "multer";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(bodyParser.json())
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))

app.use(UserRoute)
app.use(PostRoute)
app.use(FollowRoute)
app.use(CommentRoute)
app.use(LikeRoute)
app.use(ImageRoute)

app.listen(4000, () => console.log('Server up and running at http://localhost:4000'));