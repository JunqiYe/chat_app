package chat_websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

func redirectToLogin(w http.ResponseWriter) {
	w.Header().Add("location", "http://192.168.0.103:8080/login")
	w.WriteHeader(http.StatusTemporaryRedirect)
}

type session struct {
	uid        string
	expireTime time.Time
}

func (s session) isExpired() bool {
	return s.expireTime.Before(time.Now())
}

func httpChatIndexEndpoint(hub *Hub, w http.ResponseWriter, r *http.Request) {
	// new error("not implemented")

	switch r.Method {
	case "GET":

		// check if session token exists, if not, redirect to login
		tokenCookie, err := r.Cookie("session_token")
		if err != nil {
			if err == http.ErrNoCookie {
				redirectToLogin(w)
				return
			}
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		token := tokenCookie.Value
		// check if token exists in the server
		if _, ok := hub.tokens[token]; !ok {
			redirectToLogin(w)
			return
		}

		// check if token expired
		if hub.tokens[token].isExpired() {
			redirectToLogin(w)
			return
		}

		w.WriteHeader(http.StatusAccepted)
		break
	default:
		w.WriteHeader(http.StatusBadRequest)
	}
}

type credentials struct {
	UserID   string `json:"user_id"`
	Password string `json:"password"`
}

func httpChatLoginEndpoint(hub *Hub, w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		loginCredentials := credentials{}

		err := json.NewDecoder(r.Body).Decode(&loginCredentials)
		if err != nil {
			log.Println("decode error:", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// validate user credentials
		// todo

		sessionToken := uuid.NewString()
		session := session{
			uid:        loginCredentials.UserID,
			expireTime: time.Now().Add(24 * time.Hour),
		}

		hub.tokens[sessionToken] = session

		cookie := http.Cookie{
			Name:  "session_token",
			Value: sessionToken,
			Path:  "/",
			// MaxAge:   3600,
			HttpOnly: true,
			// Secure:   true,
			Expires:  session.expireTime,
			SameSite: http.SameSiteLaxMode,
		}
		http.SetCookie(w, &cookie)
		w.WriteHeader(http.StatusAccepted)

		break
	default:
		w.WriteHeader(http.StatusBadRequest)
	}
}
