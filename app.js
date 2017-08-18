const express = require('express')
const app = express()
const path = require('path')
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser')
const config = require('config')
const mysql = require('mysql')
const bcrypt = require('bcrypt')


app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')
app.use(express.static(path.join(__dirname, 'static')))


// before you use this, make sure to update the default.json file in /config
const conn = mysql.createConnection({
  host: config.get('db.host'),
  database: config.get('db.database'),
  user: config.get('db.user'),
  password: config.get('db.password')
})

app.post("/register", function(req,res,next){
	const username = req.body.username
	const password = req.body.password
	const email = req.body.email
	const fname = req.body.fname
	const lname = req.body.lname

	const sql = `
	INSERT INTO users (username, password, email, fname, lname)
	VALUES (?,?,?,?,?)
	`
	bcrypt.hash(password, 10).then(function(hashedPassword){
		conn.query(sql, [username, hashedPassword, email, fname, lname], function(err,results,fields){
			res.json({
				message: "Success!"
			})
		})
	})
})

app.post("/token", function(req,res,next){
	const username = req.body.username
	const password = req.body.password

	const sql = `
		SELECT password 
		FROM users
		WHERE username = ?
	`

	conn.query (sql, [username], function(err,results,fields){
		console.log (results)
		if (err){
			console.log (err)
		}
		const hashedPassword = results[0].password
		if (password == hashedPassword) {
			const token = uuid ()
			res.json({
				token:token
			})
		} else {
			res.status(401).json({
				message:"Invalid username and password"
			})
		}
	})
})

app.post ('/logout', function(req,res,next){
	const sql = `
		UPDATE token
		SET token = null
		WHERE token = ?
	`
	conn.query
	
})


app.post('/deck', function(req,res,next){
	const deckname = req.body.deckname

	const sql = `
		INSERT INTO deck (deckname)
		VALUES (?)
	`
	conn.query(sql,[deckname], function(err,results,fields){
		res.json({
				message: "deck created",
				deckId: results.insertId
		})
	})
})

app.get('/deck', function(req,res,next){
	const sql = `
		SELECT d.deckname
		FROM deck d
	`
})


app.post('/cards/:deckId', function(req,res,next){
	const question = req.body.question
	const answer = req.body.answer

	const sql = `
		INSERT INTO cards (question, answer, deckId)
		VALUES (?,?,?)
	`
	conn.query(sql,[question,answer, req.params.deckId], function(err,results,fields){
		res.json({
			message: "card created",
			cardId : results.insertId
		})
	})
})

app.put('/cards/:cardId', function(req,res,next){
	const question = req.body.question
	const answer = req.body.answer

	const sql = `
		UPDATE cards
		SET question = ?, answer = ?
		WHERE id = ?
	`
	conn.query(sql, [question, answer,req.params.cardId], function(err,results,fields){
		res.json({
			message: "card updated"
		})
	})
})

app.delete('/cards/:cardId', function(req,res,next){
	const sql = `
		DELETE FROM cards
		WHERE id = ?
	`
	conn.query(sql, [req.params.cardId], function(err,results,fields){
		res.json({
			message: "card deleted"
		})
	})
})

app.get('/cards', function(req,res,next){
	const sql = `
		SELECT *
		FROM
	`
})

app.listen(3000, function(){
  console.log("App running on port 3000")
})
