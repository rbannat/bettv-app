import * as React from 'react'
import { graphql, Link, PageProps } from 'gatsby'
import './styles.scss'
import Layout from '../components/layout'
import { SEO } from '../components/seo'
import Hero from '../components/hero'
import { useLocalStorage } from 'usehooks-ts'
import { FaHeart } from 'react-icons/fa'
import ClubLogo from '../components/clubLogo'

const IndexPage = ({ data }: PageProps<Queries.IndexPageQuery>) => {
  const [favoriteClubs] = useLocalStorage(
    'fav-clubs',
    [] as Array<{ id: string; name: string }>,
  )
  const [favoriteTeams] = useLocalStorage(
    'fav-teams',
    [] as Array<{ id: string; name: string }>,
  )

  function renderLogoByTeamId(id: string, teams) {
    const club = teams.find(team => team.id === id)?.club
    const image = club?.logo?.image
    return <ClubLogo logo={image} />
  }

  function renderLogoByClubId(id: string, clubs) {
    const club = clubs.find(club => club.id === id)
    const image = club?.logo?.image
    return <ClubLogo logo={image} />
  }

  return (
    <Layout>
      <Hero title={'Übersicht'}></Hero>
      <section className="section">
        <div className="container">
          {favoriteTeams?.length > 0 && (
            <h2 className="title is-4 is-flex is-align-items-center">
              Meine Teams{' '}
              <span className="icon has-text-danger ml-2">
                <FaHeart aria-hidden="true" />
              </span>
            </h2>
          )}
          <div className="columns is-multiline">
            {favoriteTeams &&
              favoriteTeams.map(favoriteTeam => (
                <div key={favoriteTeam.id} className="column is-one-quarter">
                  <Link
                    className="is-block notification is-primary is-flex is-align-items-center"
                    to={`/teams/${favoriteTeam.id}`}
                  >
                    {renderLogoByTeamId(favoriteTeam.id, data.teams.nodes)}
                    <span className="title is-size-4">{favoriteTeam.name}</span>
                  </Link>
                </div>
              ))}
          </div>

          {favoriteClubs?.length > 0 && (
            <h2 className="title is-4 is-flex is-align-items-center">
              Meine Vereine{' '}
              <span className="icon has-text-danger ml-2">
                <FaHeart aria-hidden="true" />
              </span>
            </h2>
          )}
          <div className="columns is-multiline">
            {favoriteClubs &&
              favoriteClubs.map(favoriteClub => (
                <div key={favoriteClub.id} className="column is-one-quarter">
                  <Link
                    className="is-block notification is-primary is-flex is-align-items-center"
                    to={`/clubs/${favoriteClub.id}`}
                  >
                    {renderLogoByClubId(favoriteClub.id, data.clubs.nodes)}
                    <span className="title is-size-4">{favoriteClub.name}</span>
                  </Link>
                </div>
              ))}
          </div>

          <div className="columns is-multiline">
            <div className="column is-one-quarter">
              <Link className="is-block notification is-primary" to={`/clubs`}>
                <span className="title is-size-4">Alle Vereine</span>
              </Link>
            </div>
          </div>

          <div className="columns is-multiline">
            <div className="column is-one-quarter">
              <Link
                className="is-block notification is-warning"
                to={`/leagues`}
              >
                <span className="title is-size-4">Alle Ligen</span>
              </Link>
            </div>
            {data.allGroup.nodes.map(group => (
              <div key={group.id} className="column is-one-quarter">
                <Link
                  className="is-block notification is-warning"
                  to={`/groups/${group.id}`}
                >
                  <span className="title is-size-4">{group.name}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export const Head = () => <SEO title="Übersicht" />

export const query = graphql`
  query IndexPage {
    league {
      name
      association {
        name
      }
    }
    allGroup(limit: 5) {
      nodes {
        id
        name
      }
    }
    teams: allTeam {
      nodes {
        id
        club {
          id
          logo {
            image {
              childImageSharp {
                gatsbyImageData(
                  width: 32
                  transformOptions: { fit: CONTAIN }
                  backgroundColor: "white"
                  placeholder: BLURRED
                  formats: [AUTO, WEBP, AVIF]
                )
              }
            }
          }
        }
      }
    }
    clubs: allClub {
      nodes {
        id
        logo {
          image {
            childImageSharp {
              gatsbyImageData(
                width: 32
                transformOptions: { fit: CONTAIN }
                backgroundColor: "white"
                placeholder: BLURRED
                formats: [AUTO, WEBP, AVIF]
              )
            }
          }
        }
      }
    }
  }
`

export default IndexPage
