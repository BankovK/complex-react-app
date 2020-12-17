import Axios from "axios"
import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"

function ProfileFollowing() {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const { username } = useParams()

  useEffect(() => {
    const getRequest = Axios.CancelToken.source()

    async function fetchPosts() {
      try {
        const response = await Axios.get(`profile/${username}/following`, {
          cancelToken: getRequest.token
        })
        setPosts(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log("Failed to load following.")
      }
    }
    fetchPosts()
    return () => {
      getRequest.cancel()
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
      {posts.map((follower, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${follower.username}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={follower.avatar} />{" "}
            {follower.username}
          </Link>
        )
      })}
    </div>
  )
}

export default ProfileFollowing
