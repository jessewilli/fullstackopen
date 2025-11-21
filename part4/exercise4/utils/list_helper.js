const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {

  if (blogs.length < 1) return 0

  return blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)
}

const favoriteBlog = (blogs) => {

  const favorite = blogs.reduce((max, blog) => blog.likes > max.likes ? blog : max)

  return favorite.title
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}