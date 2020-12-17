import Axios from "axios"
import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function ProfilePosts() {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const { username } = useParams()

  useEffect(() => {
    const request = Axios.CancelToken.source()

    async function fetchPosts() {
      try {
        const response = await Axios.get(`profile/${username}/posts`, {
          cancelToken: request.token
        })
        setPosts(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log("Failed to load posts.")
      }
    }
    fetchPosts()
    return () => {
      request.cancel()
    }
  }, [username])

  if (isLoading)
    return (
      <div>
        <LoadingDotsIcon />
      </div>
    )

  return (
    <div className="list-group">
      {posts.map(post => {
        return <Post noAuthor={true} post={post} key={post._id} />
      })}
    </div>
  )
}

export default ProfilePosts
