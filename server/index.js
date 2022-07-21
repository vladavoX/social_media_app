const { ApolloServer } = require('apollo-server')

const typeDefs = require('./graphql/TypeDefs')
const resolvers = require('./graphql/resolvers')

require('dotenv').config()
const port = process.env.PORT || 5000

const server = new ApolloServer({
  typeDefs,
  resolvers
})

// Connect to MongoDB
const connectDB = require('./config')

connectDB()
  .then(() => {
    return server.listen({ port: port })
  })
  .then((res) => {
    console.log(`⚡ Server running at port ${res.url}`)
  })