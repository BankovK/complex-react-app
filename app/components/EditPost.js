import React, { useState, useEffect } from "react"
import { useImmerReducer } from "use-immer"
import Page from "./Page"
import { useParams } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"

function EditPost() {
  const originalState = {
    title: { value: "", isInvalid: false, message: "" },
    body: { value: "", isInvalid: false, message: "" },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0
  }

  function editPostReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
    }
  }

  const [state, dispatch] = useImmerReducer(editPostReducer, originalState)

  useEffect(() => {
    const getRequest = Axios.CancelToken.source()

    async function fetchPost() {
      try {
        const response = await Axios.get(`post/${state.id}`, {
          cancelToken: getRequest.token
        })
        dispatch({ type: "fetchComplete", value: response.data })
      } catch (error) {
        console.log("Failed to load posts.")
      }
    }
    fetchPost()
    return () => {
      getRequest.cancel()
    }
  }, [])

  if (state.isFetching)
    return (
      <Page title="Loading...">
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <form>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            value={state.title.value}
          />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
          />
        </div>

        <button className="btn btn-primary">Update Post</button>
      </form>
    </Page>
  )
}

export default EditPost
