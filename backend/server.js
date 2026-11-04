require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("./firebaseAdmin");

const app = express();

app.use(cors());
app.use(express.json());

// Verify the user's login token
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Please log in first."
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message: "Authentication is not configured."
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).json({
                success: false,
                message: "Your session is invalid or expired. Please log in again."
            });
        }

        req.user = decoded;
        next();
    });
}

// Set up SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Subscribe endpoint
app.post("/subscribe", async (req, res) => {
    try {
        const email = req.body.email;

        // Check if email is provided
        if (!email || typeof email !== "string") {
            return res.status(400).json({
                success: false,
                message: "Please enter your email address."
            });
        }

        // Remove unnecessary spaces
        const cleanEmail = email.trim();

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Check email configuration
        if (!process.env.SENDGRID_API_KEY ||
            !process.env.SENDGRID_FROM_EMAIL) {
            return res.status(500).json({
                success: false,
                message: "Email service is not configured."
            });
        }

        // Prepare welcome email
        const message = {
            to: cleanEmail,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: "Welcome to DEV@Deakin!",
            text: "Welcome to DEV@Deakin! Thank you for subscribing to our Daily Insider. Stay tuned for updates, articles, and exciting news!",
            html: `
             <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to DEV@Deakin!</h2>
                <p>Thank you for subscribing to our Daily Insider.</p>
                <p> You'll be able to stay connected with updates, articles, and exciting news from our community.
                </p> <p>We're glad to have you with us!</p>
                <strong>The DEV@Deakin Team</strong>
            </div>
            `
        };

        // Send email
        const [sendGridResponse] = await sgMail.send(message);

        console.log("SendGrid Status Code:", sendGridResponse.statusCode);

        return res.status(200).json({
            success: true,
            message: "Welcome email sent successfully! Please check your inbox."
        });

    } catch (error) {
        console.error(
            "Email error:",
            error.response?.body || error.message
        );

        return res.status(500).json({
            success: false,
            message: "We could not send your welcome email. Please try again later."
        });
    }

});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const userRef = db.collection("users").doc(cleanEmail);
        const existingUser = await userRef.get();

        if (existingUser.exists) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await userRef.set({
            name: cleanName,
            email: cleanEmail,
            passwordHash,
            plan: "Free"
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully. You can now log in."
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again later."
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const userSnapshot = await db
            .collection("users")
            .where("email", "==", cleanEmail)
            .limit(1)
            .get();

        if (userSnapshot.empty) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = userSnapshot.docs[0].data();

        // Check whether the user has a stored password hash
        if (!user.passwordHash) {
            console.log("Login failed: Password hash missing:", cleanEmail);

            return res.status(401).json({
                success: false,
                message: "This account needs to be registered through the current registration system."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            console.log("Login failed: Password does not match:", cleanEmail);

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        const token = jwt.sign(
            {
                email: user.email,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("Login successful:", cleanEmail);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again later."
        });
    }
});

// Get the logged-in user's current plan
app.get("/my-plan", authenticateToken, async (req, res) => {
    try {
        const cleanEmail = req.user.email.trim().toLowerCase();

        const userRef = db.collection("users").doc(cleanEmail);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        const userData = userDoc.data();

        return res.status(200).json({
            success: true,
            plan: userData.plan || "Free"
        });

    } catch (error) {
        console.error("Get plan error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve your plan."
        });
    }
});

// Upgrade the logged-in user's plan
app.post("/upgrade-plan", authenticateToken, async (req, res) => {
    try {
        const cleanEmail = req.user.email.trim().toLowerCase();

        const userRef = db.collection("users").doc(cleanEmail);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        const userData = userDoc.data();
        const currentPlan = userData.plan || "Free";

        // Prevent users from upgrading twice
        if (currentPlan === "Paid") {
            return res.status(409).json({
                success: false,
                message: "You are already on the Paid plan."
            });
        }

        // Save the new plan to Firestore
        await userRef.update({
            plan: "Paid",
            planUpdatedAt: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            message: "Your plan has been upgraded successfully!",
            plan: "Paid"
        });

    } catch (error) {
        console.error("Upgrade plan error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to upgrade your plan. Please try again."
        });
    }
});

// Save a new post in Firestore
app.post("/posts", authenticateToken, async (req, res) => {
    try {
        const { type, title, abstract, content, tags, plan } = req.body;


        // Validate required fields
        if (!type || !title || !content || !plan) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields."
            });
        }

        if (!["Question", "Article"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post type."
            });
        }

        if (title.trim().length < 6 || title.trim().length > 150) {
            return res.status(400).json({
                success: false,
                message: "Title must contain 6-150 characters."
            });
        }

        if (!["Free", "Paid"].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post plan."
            });
        }

        if (type === "Article" && (!abstract || !abstract.trim())) {
            return res.status(400).json({
                success: false,
                message: "Article abstract is required."
            });
        }

        if (type === "Question" && abstract) {
            return res.status(400).json({
                success: false,
                message: "Questions should not contain an abstract."
            });
        }

        if (typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Post content is required."
            });
        }

        if (content.length > (type === "Article" ? 10000 : 5000)) {
            return res.status(400).json({
                success: false,
                message: "Post content is too long."
            });
        }

        if (!Array.isArray(tags) || tags.length > 3 ||
            tags.some(tag => typeof tag !== "string" ||
                tag.trim().length < 2 || tag.trim().length > 20)) {
            return res.status(400).json({
                success: false,
                message: "Please provide up to 3 valid tags."
            });
        }

        // Get logged-in user
        const email = req.user.email.toLowerCase();
        const userRef = db.collection("users").doc(email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        const user = userDoc.data();
        const userPlan = user.plan || "Free";

        // Check membership before allowing Paid posts
        if (plan === "Paid" && userPlan !== "Paid") {
            return res.status(403).json({
                success: false,
                message: "Upgrade to the Paid plan to publish Paid posts."
            });
        }

        // Save post
        const postRef = db.collection("posts").doc();

        await postRef.set({
            type,
            title: title.trim(),
            abstract: type === "Article" ? abstract.trim() : "",
            content: content.trim(),
            tags: tags.map(tag => tag.trim().toLowerCase()),
            plan,
            userId: email,
            createdAt: new Date()
        });

        return res.status(201).json({
            success: true,
            message: "Post published successfully!",
            postId: postRef.id
        });

    } catch (error) {
        console.error("Post creation error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to publish post. Please try again."
        });
    }

});

// Get posts based on user's membership
app.get("/posts", async (req, res) => {
try {
let userPlan = "Free";

    const token = req.headers.authorization;

    // Check if user is logged in
    if (token) {
        const userToken = token.split(" ")[1];

        if (!userToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid login token."
            });
        }

        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);

        const userDoc = await db.collection("users")
            .doc(decoded.email.toLowerCase())
            .get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        userPlan = userDoc.data().plan || "Free";
    }

    // Get posts from Firestore
    let snapshot;

    if (userPlan === "Paid") {
        snapshot = await db.collection("posts").get();
    } else {
        snapshot = await db.collection("posts")
            .where("plan", "==", "Free")
            .get();
    }

    const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Sort newest posts first
    posts.sort((a, b) =>
        b.createdAt.toMillis() - a.createdAt.toMillis()
    );

    return res.status(200).json({
        success: true,
        posts: posts
    });

} catch (error) {
    console.error("Browse posts error:", error.message);

    return res.status(500).json({
        success: false,
        message: "Unable to fetch posts."
    });
}


});



// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "The requested API endpoint was not found."
    });
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
