import React, {useState} from "react"
import "./GitHubSearch.css"
import ResultCard from "./ResultCard"

/**
 * The main component of the application
 * Requesting user input with a search input and showing fetched results
 */
export default function GitHubSearch() {

    const [results, setResults] = useState([])
    const [repoCount, setRepoCount] = useState("")
    const [resultCursor, setResultCursor] = useState("")
    const [moreResults, setMoreResults] = useState(false)

    /** error notice for the user */ 
    const fetchError = () => {alert("There has been a problem fetching the repositories data!")}

    /**
     * Form the graphQL request with the search query and optionally the cursor of the last displayed element
     * (to load more results)
     * Then fetch results and return them if no error occurred
     * @param {string} query the query to search for
     * @param {string} after the cursor of the last previous element
     */
    const fetchQuery = (query, after) => {
        return new Promise( (res, rej) => {

            // prepare request
            // TODO: replace the authentication with your data
            const userlogin = "YOUR-LOGIN"
            const authcode = "YOUR-TOKEN"
            after = (after === undefined) ? "" : ", after: \"" + after + "\""
            const numberOfResults = 10
            const numberOfLanguages = 3
    
            fetch("https://api.github.com/graphql",{
                method: "POST",
                headers: {
                    Authorization: "Basic " + btoa(userlogin + ":" + authcode),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: "query {search(query: \"" + query + "\", type: REPOSITORY, first: " + numberOfResults + after + ") {repositoryCount pageInfo{endCursor hasNextPage} edges { node { ... on Repository { name description languages(first:" + numberOfLanguages + "){nodes{color name}} stargazers(first: 0){totalCount} url }}}}}"
                })
            }).then( data => {
                if(data.status === 200) {
                    data.json().then( result => {
                        // check if GraphQL request failed
                        if (result.errors) {
                            let gqlError = "The GraphQL request returned errors: \n"
                            result.errors.forEach(err => {gqlError += err})
                            rej(gqlError)
                        } else {
                            // received data is okay
                            res(result.data.search)
                        }
                    }, err => {
                        rej("Could not parse JSON response: " + err)
                    })
                } else {
                    rej("Received bad response status: " + data.status + " " + data.statusText)
                }
            }, err => {
                rej("Problem with fetch request: " + err)
            })
        })
    }

    /**
     * Check if the user is still typing,
     * if not fetch results for the query,
     * check again if input has changed
     * then display results
     * @param {object} e the event, which triggered the function call
     */
    const searchRepos = (e) => {
        
        const query = e.target.value
        // check if search input still contains chars, otherwise reset
        if (query === "") {
            setResults([])
            setRepoCount("")
            setResultCursor("")
            setMoreResults(false)
        } else {
            setTimeout( () => {
                // check if input has already changed (after 100ms) to reduce number of request while typing
                const initQuery = document.getElementById("searchQuery").value
                if (query === initQuery) {
                    fetchQuery(query).then( repos => {
                        // check if search query has changed while fetching results
                        if (query === document.getElementById("searchQuery").value) {
                            setResults(repos.edges)
                            setRepoCount("" + repos.repositoryCount)
                            setResultCursor(repos.pageInfo.endCursor)
                            setMoreResults(repos.pageInfo.hasNextPage)
                        }
                    }, err => {
                        console.error(err)
                        fetchError()
                    })
                }
            }, 400)
        }
    }

    /**
     * loads the next bunch of results and diplays them
     */
    const showMore = () => {
        const query = document.getElementById("searchQuery").value 
        fetchQuery(query, resultCursor).then( repos => {
            // check if search query has changed while fetching results
            if (query === document.getElementById("searchQuery").value) {
                setResults(results.concat(repos.edges))
                setResultCursor(repos.pageInfo.endCursor)
                setMoreResults(repos.pageInfo.hasNextPage)
            }
        }, err => {
            console.error(err)
            fetchError()
        })
    }

    return (
        <div className="SearchBox">
        
            <form className="SearchBar">
                <label htmlFor="SearchText"><h1>Search Repository</h1></label><br/>
                <input id="searchQuery" className="SearchText" type="text" placeholder="your search query" onChange={(e) => searchRepos(e)}></input>
            </form>

            <div className="resultsBox">
                {results.map( (repo, ind) => (
                    <ResultCard repository={repo.node} key={ind} />
                ))}
            </div>

            <div className="resultsStats" style={{display: (resultCursor === "" ? "none" : "")}}>
                <p>Showing {results.length} of {repoCount} repositories</p>
                <button onClick={showMore} style={{display: moreResults ? "" : "none"}}>Show More</button>
            </div>
        </div>
    )
}