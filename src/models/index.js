import db from "../config/Database.js";
import "./CommentModel.js";
import "./FollowModel.js";
import "./UserModel.js";
import "./LikeModel.js";
import "./PostModel.js";
import "./SaveModel.js";
import "./StoryModel.js";
import "./ViewModel.js";

(async () => {
    await db.sync({ alter: true });
})();

