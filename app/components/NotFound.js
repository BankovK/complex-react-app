import React from "react"
import Page from "./Page"
import { Link } from "react-router-dom"

function NotFound() {
  return (
    <Page title="Whoops...">
      <div className="text-center">
        <h2>We can't find this page.</h2>
        <p className="lead text-muted">
          Return <Link to="/">home</Link>.
        </p>
      </div>
    </Page>
  )
}

export default NotFound
