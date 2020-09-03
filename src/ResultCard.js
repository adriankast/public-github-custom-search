import React from "react"
import "./ResultCard.css"
import { StarIcon } from "@primer/octicons-react"
import PropTypes from "prop-types"

/**
 * Takes information about a repository as property
 * and displays it in form of a card
 * @param {object} repository the repository object to be displayed 
 */
export default function ResultCard({repository}) {
    return(
        <div className="result">
            <div className="resultHeader">                    
                <a href={repository.url} target="_blank" rel="noopener noreferrer" title={repository.name}>
                    <h3>{repository.name.toUpperCase()}</h3>
                </a>
            </div>

            <div className="resultMain">{repository.description}</div>
            <div className="resultFooter">
                <div className="languages">
                    {repository.languages.nodes.map(lang => (
                        <div key={lang.name} className="languageCircle" style={{backgroundColor: lang.color === null ? "white" : lang.color}} title={lang.name}><span>{lang.name}</span></div>
                    ))}
                </div>
                <div className="stars">                    
                    <span>{repository.stargazers.totalCount}</span>
                    <StarIcon size={16} />
                </div>
            </div>
        </div>
    )
}

ResultCard.propTypes = {
    repository: PropTypes.object.isRequired
}
