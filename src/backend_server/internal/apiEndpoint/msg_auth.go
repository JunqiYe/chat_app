package apiEndpoint

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

func redirectToLogin(w http.ResponseWriter) {
	// w.Header().Add("location", "http://192.168.0.103:8080/login")
	// w.WriteHeader(http.StatusTemporaryRedirect)
	w.WriteHeader(http.StatusNoContent)
}

type session struct {
	uid        string
	expireTime time.Time
}

func (s session) isExpired() bool {
	return s.expireTime.Before(time.Now())
}

func httpChatIndexEndpoint(hub *Hub, w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	log.Println("[GET]: ", origin)
	w.Header().Add("Access-Control-Allow-Origin", origin)
	w.Header().Add("Access-Control-Allow-Credentials", "true")

	switch r.Method {
	case "GET":

		// check if session token exists, if not, redirect to login
		tokenCookie, err := r.Cookie("session_token")
		if err != nil {
			if err == http.ErrNoCookie {
				log.Println("[GET]: request doesn't have session_token")
				redirectToLogin(w)
				return
			}
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		}

		token := tokenCookie.Value
		log.Println("[GET]: reading session token:", token)

		// check if token exists in the server
		if _, ok := hub.tokens[token]; !ok {
			log.Println("[GET]: session_token doesn't exist in server")
			redirectToLogin(w)
			return
		}

		// check if token expired
		if hub.tokens[token].isExpired() {
			log.Println("[GET]: session_token expired")
			redirectToLogin(w)
			return
		}

		w.WriteHeader(http.StatusOK)
		cred := credentials{
			UserID:   hub.tokens[token].uid,
			Password: "",
		}
		b, err := json.Marshal(cred)
		if err != nil {
			log.Println(err)
			redirectToLogin(w)
			return
		}

		w.Write(b)
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
	origin := r.Header.Get("Origin")
	log.Println(origin)
	w.Header().Add("Access-Control-Allow-Origin", origin)
	w.Header().Add("Access-Control-Allow-Credentials", "true")
	switch r.Method {
	case "OPTIONS":
		w.Header().Add("Allow", "POST")
		w.Header().Add("Access-Control-Allow-Headers", "Content-Type, Credential")
		w.WriteHeader(http.StatusNoContent)
		break

	case "POST":
		loginCredentials := credentials{}

		err := json.NewDecoder(r.Body).Decode(&loginCredentials)

		log.Println("[POST]: userid:", loginCredentials.UserID)
		if err != nil {
			log.Println("[POST]: decode error:", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// validate user credentials
		// todo

		sessionToken := uuid.NewString()
		log.Println("[POST]: new session token:", sessionToken)
		session := session{
			uid:        loginCredentials.UserID,
			expireTime: time.Now().Add(24 * time.Hour),
		}

		hub.tokens[sessionToken] = session

		cookie := http.Cookie{
			Name:     "session_token",
			Value:    sessionToken,
			Path:     "/",
			MaxAge:   3600,
			HttpOnly: true,
			Secure:   false,
			Expires:  session.expireTime,
			// SameSite: http.SameSiteNoneMode,
		}
		log.Println("[POST]: setting new cookie")
		http.SetCookie(w, &cookie)

		// w.Write(json.Marshal())
		w.WriteHeader(http.StatusOK)

		break
	default:
		w.WriteHeader(http.StatusBadRequest)
	}
}
