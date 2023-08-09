
function getGoogleOAuthURL() {
  const baseUri = "https://accounts.google.com/o/oauth2/auth";
  const options = {
    redirect_uri:process.env.REACT_APP_GOOGLE_OAUTH_REDIRECT_URI,
    client_id: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
    access_type:"offline",
    response_type:"code",
    prompt:"consent",
    scope:[
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",

    ].join(" "),
  }

  const qs = new URLSearchParams(options)

  return `${baseUri}?${qs.toString()}`
}

export default getGoogleOAuthURL
