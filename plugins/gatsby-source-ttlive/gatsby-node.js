const fetch = require("node-fetch")
const { parseStringPromise } = require("xml2js")
const { processLeagueTable } = require("./processLeagueTable")
const { processAssociation } = require("./processAssociation")
const { processGame } = require("./processGame")
const { processTeamReport } = require("./processTeamReport")

const xml2jsOptions = {
  noramlize: true,
  normalizeTags: true,
  explicitArray: false,
  explicitRoot: false,
}

exports.sourceNodes = async ({ actions, createNodeId }, configOptions) => {
  const { createNode } = actions
  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins
  const { leagueId, homeTeamId } = configOptions

  const teamReportUrl = `https://bettv.tischtennislive.de/Export/default.aspx?TeamID=${homeTeamId}&WettID=${leagueId}&Format=XML&SportArt=96&Area=TeamReport`
  const teamReportResponse = await fetch(teamReportUrl)
  const teamReport = await parseStringPromise(
    await teamReportResponse.text(),
    xml2jsOptions
  )

  const scheduleFirstHalfUrl = `https://bettv.tischtennislive.de/Export/default.aspx?LigaID=${leagueId}&Format=XML&SportArt=96&Area=Spielplan&Runde=1`
  const scheduleFirstHalfResponse = await fetch(scheduleFirstHalfUrl)
  const scheduleFirstHalf = await parseStringPromise(
    await scheduleFirstHalfResponse.text(),
    xml2jsOptions
  )

  const scheduleSecondHalfUrl = `https://bettv.tischtennislive.de/Export/default.aspx?LigaID=${leagueId}&Format=XML&SportArt=96&Area=Spielplan&Runde=2`
  const scheduleSecondHalfResponse = await fetch(scheduleSecondHalfUrl)
  const scheduleSecondHalf = await parseStringPromise(
    await scheduleSecondHalfResponse.text(),
    xml2jsOptions
  )

  const leagueTableUrl = `https://bettv.tischtennislive.de/Export/default.aspx?LigaID=${leagueId}&Format=XML&SportArt=96&Area=Tabelle`
  const leagueTableResponse = await fetch(leagueTableUrl)
  const leagueTable = await parseStringPromise(
    await leagueTableResponse.text(),
    xml2jsOptions
  )

  const games = [
    ...scheduleFirstHalf.content.spiel,
    ...scheduleSecondHalf.content.spiel,
  ]

  const associationsUrl = "https://app.web4sport.de/ajax/Verband.ashx"
  const associationsResponse = await fetch(associationsUrl)
  const { verband: associations } = await parseStringPromise(
    await associationsResponse.text(),
    xml2jsOptions
  )

  associations.forEach(association => {
    createNode(processAssociation({ association, createNodeId }))
  })
  games.forEach((game, index) => {
    createNode(processGame({ id: `game${index}`, game, createNodeId }))
  })
  createNode(processLeagueTable({ leagueTable, createNodeId }))
  createNode(processTeamReport({ teamReport, createNodeId }))
  return
}
