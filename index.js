import express from "express";
import cors from "cors";
import UserRoute from "./src/routes/UserRoute.js"
import PostRoute from "./src/routes/PostRoute.js"
import FollowRoute from "./src/routes/FollowRoute.js"
import CommentRoute from "./src/routes/CommentRoute.js"
import LikeRoute from "./src/routes/LikeRoute.js"
import ImageRoute from "./src/routes/ImageRoute.js"
import StoryRoute from "./src/routes/StoryRoute.js"
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.use(bodyParser.json())

app.use(
    fileUpload({
        abortOnLimit: true,
    })
);

app.use(UserRoute)
app.use(PostRoute)
app.use(FollowRoute)
app.use(CommentRoute)
app.use(LikeRoute)
app.use(ImageRoute)
app.use(StoryRoute)

app.listen(4000, () => console.log('Server up and running at http://localhost:4000'));