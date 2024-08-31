import React, { useState } from 'react'
import { HeadProps, Link, PageProps, graphql } from 'gatsby'
import Layout from '../components/layout'
import { SEO } from '../components/seo'
import Hero from '../components/hero'
import { Button, Modal, Form } from 'react-bulma-components'
import { calculateTtr } from '../utils/ttr'
import { useLocalStorage } from 'usehooks-ts'
import { FaCalculator } from 'react-icons/fa'
import { firstHalfCompleted } from '../utils/constants'
import { ImageDataLike } from 'gatsby-plugin-image'

const PlayerPage = ({ data }: PageProps<Queries.PlayerPageQuery>) => {
  const [activeTab, setActiveTab] = useState(
    firstHalfCompleted ? 'secondHalf' : 'firstHalf',
  )
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [myTtr, setMyTtr] = useLocalStorage<null | string>('my-ttr', null)
  const [age, setAge] = useLocalStorage('age', 'option1')
  const [totalBelow30, setTotalBelow30] = useLocalStorage(
    'total-below-30',
    false,
  )
  const [below15AfterOneYear, setBelow15AfterOneYear] = useLocalStorage(
    'below-15-after-one-year',
    false,
  )

  const closeModal = () => {
    setIsOpenModal(false)
  }
  const openModal = () => {
    setIsOpenModal(true)
  }

  const playerScores = data.allPlayerScore?.nodes
  const livePz = playerScores && playerScores[0] && playerScores[0].score
  const { winPoints, losePoints, winTtr, loseTtr, winProbability } =
    calculateTtr(
      parseInt(myTtr || '0'),
      livePz || 0,
      age === 'option2',
      age === 'option3',
      totalBelow30,
      below15AfterOneYear,
    )

  const subtitle = (
    <>
      <Link
        className="is-size-6 has-text-inherit"
        to={`/clubs/${playerScores[0].team?.club?.id}`}
      >
        {playerScores[0].team?.club?.shortName}
      </Link>
    </>
  )

  return (
    <Layout>
      <Hero
        title={data.player?.name ?? ''}
        clubLogo={{
          image: playerScores[0].team?.club?.logo?.image as ImageDataLike,
          size: 'large',
        }}
        subtitle={subtitle}
      ></Hero>

      <section className="section">
        <div className="container">
          <div className="level is-mobile">
            <div className="level-item has-text-centered">
              {livePz && (
                <div>
                  <p className="heading">LivePZ </p>
                  <p className="title">{livePz}</p>
                  <p className="mt-3">
                    <Button
                      size={'small'}
                      title="LivePZ berechnen"
                      onClick={openModal}
                    >
                      <span className="icon">
                        <FaCalculator aria-hidden="true" />
                      </span>
                      <span>LivePZ berechnen</span>
                    </Button>
                  </p>
                </div>
              )}
            </div>
            <div className="level-item has-text-centered">
              {data.allPlayerScore.wonTotal && (
                <div>
                  <p className="heading">Gewonnen</p>
                  <p className="title has-text-success mb-5">
                    {data.allPlayerScore.wonTotal}
                  </p>
                </div>
              )}
            </div>
            <div className="level-item has-text-centered">
              {data.allPlayerScore.lostTotal && (
                <div>
                  <p className="heading">Verloren</p>
                  <p className="title has-text-danger mb-5">
                    {data.allPlayerScore.lostTotal}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="block">
            <div className="tabs">
              <ul>
                <li className={activeTab === 'firstHalf' ? 'is-active' : ''}>
                  <a onClick={() => setActiveTab('firstHalf')}>Hinrunde</a>
                </li>
                <li className={activeTab === 'secondHalf' ? 'is-active' : ''}>
                  <a
                    className={activeTab === 'secondHalf' ? 'is-active' : ''}
                    onClick={() =>
                      firstHalfCompleted && setActiveTab('secondHalf')
                    }
                  >
                    Rückrunde
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="table-container u-grow">
            <table className="table is-fullwidth is-narrow is-striped">
              <thead>
                <tr>
                  <th>Mannschaft</th>
                  <th>Position</th>
                  <th>Sp</th>
                  <th>PK 1</th>
                  <th>PK 2</th>
                  <th>Ges</th>
                </tr>
              </thead>
              <tbody>
                {playerScores
                  ?.filter(
                    score =>
                      score?.isSecondHalf === (activeTab === 'secondHalf'),
                  )
                  .map(score => {
                    return (
                      <tr key={score?.team?.id}>
                        <td>
                          <Link to={`/teams/${score?.team?.id}`}>
                            {score?.team?.name}
                          </Link>
                        </td>
                        <td>{score?.position}</td>
                        <td>{score?.gamesPlayed}</td>
                        <td>{score?.pk1Diff?.join(':')}</td>
                        <td>{score?.pk2Diff?.join(':')}</td>
                        <td>
                          {(score?.won || score?.lost) &&
                            [score?.won, score?.lost].join(':')}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <Modal
        show={isOpenModal}
        closeOnEsc={true}
        closeOnBlur={true}
        onClose={closeModal}
      >
        <Modal.Card>
          <Modal.Card.Body>
            <div className="content">
              <h3 className="title is-size-4">LivePZ-Rechner</h3>
              <form className="mb-4">
                <Form.Field kind="group">
                  <Form.Control fullwidth>
                    <Form.Label htmlFor="livepz">LivePZ</Form.Label>
                    <Form.Input
                      id="livepz"
                      value={myTtr || ''}
                      type="number"
                      min="0"
                      max="9999"
                      onChange={e => setMyTtr(e.target.value)}
                    />
                  </Form.Control>
                  <Form.Control>
                    <Form.Label htmlFor="ageInput">Alter</Form.Label>
                    <Form.Select
                      id="ageInput"
                      onChange={e => setAge(e.target.value)}
                      value={age}
                    >
                      <option value="option1">21 oder älter</option>
                      <option value="option2">jünger als 21</option>
                      <option value="option3">jünger als 16</option>
                    </Form.Select>
                  </Form.Control>
                </Form.Field>
                <Form.Field>
                  <Form.Control>
                    <Form.Checkbox
                      checked={below15AfterOneYear}
                      onChange={() =>
                        setBelow15AfterOneYear(!below15AfterOneYear)
                      }
                    >
                      Letztes Spiel liegt mehr als 1 Jahr zurück (bis 15 Spiele)
                    </Form.Checkbox>
                  </Form.Control>
                </Form.Field>
                <Form.Field>
                  <Form.Control>
                    <Form.Checkbox
                      checked={totalBelow30}
                      onChange={() => setTotalBelow30(!totalBelow30)}
                    >
                      Weniger als 30 gespielte Spiele
                    </Form.Checkbox>
                  </Form.Control>
                </Form.Field>
              </form>
              <p>
                Die <strong>Gewinnwahrscheinlichkeit</strong> gegen{' '}
                <strong>
                  {data.player?.name} ({livePz})
                </strong>{' '}
                beträgt:
              </p>
              <div className="level is-mobile mb-3">
                <div className="level-item has-text-centered">
                  <div>
                    <p className="title has-text-success">{winProbability} %</p>
                  </div>
                </div>
              </div>
              <div className="level is-mobile mb-2">
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Sieg</p>
                    <p className="title is-size-4 has-text-success">
                      {winTtr} (+{winPoints})
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Niederlage</p>
                    <p className="title is-size-4 has-text-danger">
                      {loseTtr} ({losePoints})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Card.Body>
        </Modal.Card>
      </Modal>
    </Layout>
  )
}

export const Head = ({ data }: HeadProps<Queries.PlayerPageQuery>) => (
  <SEO title={data.player?.name ?? ''} />
)

export const query = graphql`
  query PlayerPage($playerId: String!) {
    player(id: { eq: $playerId }) {
      id
      name
    }
    allPlayerScore(
      filter: { player: { id: { eq: $playerId } } }
      sort: { position: ASC }
    ) {
      nodes {
        position
        isSecondHalf
        team {
          id
          name
          club {
            id
            shortName
            logo {
              image {
                childImageSharp {
                  gatsbyImageData(
                    width: 64
                    height: 64
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
        gamesPlayed
        pk1Diff
        pk2Diff
        won
        lost
        score
      }
      wonTotal: sum(field: { won: SELECT })
      lostTotal: sum(field: { lost: SELECT })
    }
  }
`

export default PlayerPage
