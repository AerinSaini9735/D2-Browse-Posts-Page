import { useState, useEffect } from "react";
import Logout from "./logout";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function Header() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(
        Boolean(localStorage.getItem("token"))
    );

    useEffect(() => {
        function updateLoginStatus() {
            setIsLoggedIn(Boolean(localStorage.getItem("token")));
        }

        window.addEventListener("authChange", updateLoginStatus);

        return () => {
            window.removeEventListener("authChange", updateLoginStatus);
        };
    }, []);

    return (
        <div className="navigation-menu">
            <div className="title-block">
                <Link className="title" to="/">
                    DEV@Deakin
                </Link>
            </div>

            <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="logo"
            />

            <input className="search-box" type="text" placeholder="Search" />

            <div>
                <p className="post-button" onClick={() => navigate("/post")}>
                    Post
                </p>
            </div>

            <div>
                <p className="browse-post-button"onClick={() => navigate("/browse-posts")}>
                    Browse Posts
                </p>
            </div>

            <div>
                <p className="pricing-button" onClick={() => navigate("/pricing")}>
                    Pricing
                </p>
            </div>

            <div>
                {isLoggedIn ? (
                    <>
                        <span className="user-name">
                            Hi, {JSON.parse(localStorage.getItem("user") || "{}").name}
                        </span>
                        <Logout />
                    </>
                ) : (
                    <p className="login-button" onClick={() => navigate("/login")}>
                        Login
                    </p>
                )}
            </div>
        </div>
    );
}

export default Header;