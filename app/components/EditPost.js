import React, { useContext, useEffect } from "react"
import { useImmerReducer } from "use-immer"
import Page from "./Page"
import { useParams } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function EditPost() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

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
        break
      case "titleChange":
        draft.title.value = action.value
        break
      case "bodyChange":
        draft.body.value = action.value
        break
      case "submitRequest":
        draft.sendCount++
        break
      case "saveRequestStarted":
        draft.isSaving = true
        break
      case "saveRequestFinished":
        draft.isSaving = false
        break
    }
  }

  const [state, dispatch] = useImmerReducer(editPostReducer, originalState)

  function submitHandler(e) {
    e.preventDefault()
    dispatch({ type: "submitRequest" })
  }

  // Get post
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

  // Update post
  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" })
      const postRequest = Axios.CancelToken.source()

      async function fetchPost() {
        try {
          const response = await Axios.post(
            `post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token
            },
            {
              cancelToken: postRequest.token
            }
          )
          dispatch({ type: "saveRequestFinished" })
          appDispatch({ type: "flashMessage", value: "Post updated." })
        } catch (error) {
          console.log("Failed to load posts.")
        }
      }
      fetchPost()
      return () => {
        postRequest.cancel()
      }
    }
  }, [state.sendCount])

  if (state.isFetching)
    return (
      <Page title="Loading...">
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <form onSubmit={submitHandler}>
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
            onChange={e =>
              dispatch({ type: "titleChange", value: e.target.value })
            }
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
            onChange={e =>
              dispatch({ type: "bodyChange", value: e.target.value })
            }
          />
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          {state.isSaving ? "Updating..." : "Update Post"}
        </button>
      </form>
    </Page>
  )
}

export default EditPost
