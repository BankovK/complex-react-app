import React, { useContext, useEffect } from "react"
import { useImmerReducer } from "use-immer"
import Page from "./Page"
import { useParams, Link, withRouter } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import NotFound from "./NotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function EditPost(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const originalState = {
    title: { value: "", isInvalid: false, message: "" },
    body: { value: "", isInvalid: false, message: "" },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }

  function editPostReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        break
      case "titleChange":
        draft.title.isInvalid = false
        draft.title.value = action.value
        break
      case "bodyChange":
        draft.body.isInvalid = false
        draft.body.value = action.value
        break
      case "submitRequest":
        if (!draft.title.isInvalid && !draft.body.isInvalid) {
          draft.sendCount++
        }
        break
      case "saveRequestStarted":
        draft.isSaving = true
        break
      case "saveRequestFinished":
        draft.isSaving = false
        break
      case "titleCheck":
        if (!action.value.trim()) {
          draft.title.isInvalid = true
          draft.title.message = "Provide a title!"
        }
        break
      case "bodyCheck":
        if (!action.value.trim()) {
          draft.body.isInvalid = true
          draft.body.message = "Provide content!"
        }
        break
      case "notFound":
        draft.notFound = true
        break
    }
  }

  const [state, dispatch] = useImmerReducer(editPostReducer, originalState)

  function submitHandler(e) {
    e.preventDefault()
    dispatch({ type: "titleCheck", value: state.title.value })
    dispatch({ type: "bodyCheck", value: state.body.value })
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
        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data })
          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: "flashMessage",
              value: "You are not allowed to change that post!"
            })
            props.history.push("/")
          }
        } else {
          dispatch({ type: "notFound" })
        }
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

      async function updatePost() {
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
      updatePost()
      return () => {
        postRequest.cancel()
      }
    }
  }, [state.sendCount])

  if (state.notFound) {
    return <NotFound />
  }

  if (state.isFetching)
    return (
      <Page title="Loading...">
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        Back to view
      </Link>
      <form className="mt-3" onSubmit={submitHandler}>
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
            onBlur={e =>
              dispatch({ type: "titleCheck", value: e.target.value })
            }
          />
          {state.title.isInvalid && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
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
            onBlur={e => dispatch({ type: "bodyCheck", value: e.target.value })}
          />
          {state.body.isInvalid && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          )}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          {state.isSaving ? "Updating..." : "Update Post"}
        </button>
      </form>
    </Page>
  )
}

export default withRouter(EditPost)
