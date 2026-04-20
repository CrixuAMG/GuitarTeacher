import { execSync } from 'child_process'
import { writeFileSync, unlinkSync, mkdtempSync, rmdirSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

const OPENCODE_PATH = '/opt/homebrew/bin/opencode'
const PROJECT_DIR = '/Users/christiankaal/Code/GuitarTeacher'
const TIMEOUT_MS = 120000

export default function opencodePlugin() {
  return {
    name: 'opencode-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url

        // /api/search-chordpro
        if (url === '/api/search-chordpro') {
          res.setHeader('Content-Type', 'application/json')
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const { query } = JSON.parse(body)
              if (!query) throw new Error('Query required')
              const searchTerms = encodeURIComponent(`${query} chordpro cho`)
              const url = `https://duckduckgo.com/html/?q=${searchTerms}`
              const https = await import('node:https')
              const searchResult = await new Promise((resolve, reject) => {
                https
                  .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (resp) => {
                    let data = ''
                    resp.on('data', (c) => (data += c))
                    resp.on('end', () => resolve(data))
                  })
                  .on('error', reject)
              })
              const choRegex = /href="(https?:\/\/[^"]+)"/gi
              const results = []
              let match
              while ((match = choRegex.exec(searchResult)) !== null) {
                const href = match[1]
                if (
                  href.includes('.cho') ||
                  href.includes('chopro') ||
                  href.includes('chordie') ||
                  href.includes('ultimate-guitar') ||
                  href.includes('chordpro')
                ) {
                  results.push(href)
                }
              }
              res.end(JSON.stringify({ results: [...new Set(results)].slice(0, 5) }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        // /api/fetch-chordpro
        if (url === '/api/fetch-chordpro') {
          res.setHeader('Content-Type', 'application/json')
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const { url: fetchUrl } = JSON.parse(body)
              if (!fetchUrl) throw new Error('URL required')
              const https = await import(fetchUrl.startsWith('http:') ? 'node:http' : 'node:https')
              const content = await new Promise((resolve, reject) => {
                https
                  .get(fetchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (resp) => {
                    let d = ''
                    resp.on('data', (c) => (d += c))
                    resp.on('end', () => resolve(d))
                  })
                  .on('error', reject)
              })
              res.end(JSON.stringify({ content: content.slice(0, 50000) }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: `Fetch failed: ${err.message}` }))
            }
          })
          return
        }

        // /api/generate-chords
        if (url === '/api/generate-chords') {
          res.setHeader('Content-Type', 'application/json')
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            let payload
            try {
              payload = JSON.parse(body)
            } catch {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
              return
            }
            const { link, lyrics } = payload
            if (!link && !lyrics) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Provide a link or lyrics' }))
              return
            }
            let prompt = 'Generate a ChordPro song file.'
            if (link) prompt += ` The song link is: ${link}.`
            if (lyrics) prompt += ` Here are the lyrics:\n${lyrics}`
            prompt +=
              '\nOutput ONLY valid ChordPro format. No markdown, no code fences, no explanation. Include {title:}, {artist:}, chords inline like [Am], strumming pattern as {strum: down down up down up down up down}, BPM as {bpm: N}, difficulty as {difficulty: beginner|intermediate|advanced}, capo if needed. Mark song sections with {start_of_verse}/{end_of_verse}, {start_of_chorus}/{end_of_chorus}, {start_of_bridge}/{end_of_bridge}, {start_of_intro}/{end_of_intro}. Mark any iconic riffs or solos with {start_of_riff: Main Riff}/{end_of_riff} or {start_of_solo: Guitar Solo}/{end_of_solo}.'
            const tmpDir = mkdtempSync(join(tmpdir(), 'guitar-ai-'))
            const promptFile = join(tmpDir, 'prompt.txt')
            try {
              writeFileSync(promptFile, prompt, 'utf8')
              const escapedPath = promptFile.replace(/'/g, "'\\''")
              const cmd = `cat '${escapedPath}' | ${OPENCODE_PATH} run --format json -m opencode-go/glm-5.1 -- "$(cat '${escapedPath}')"`
              const stdout = execSync(cmd, {
                timeout: TIMEOUT_MS,
                maxBuffer: 10 * 1024 * 1024,
                cwd: PROJECT_DIR,
                env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
                encoding: 'utf8',
              })
              const lines = stdout
                .trim()
                .split('\n')
                .filter((l) => l.trim())
              let content = ''
              for (const line of lines) {
                try {
                  const event = JSON.parse(line)
                  if (event.type === 'text' && event.part?.text) content += event.part.text
                } catch {
                  content += line
                }
              }
              content = content
                .replace(/^```(?:cho|chopro|text|chordpro)?\n?/im, '')
                .replace(/\n?```$/m, '')
                .trim()
              if (!content) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'OpenCode returned empty content' }))
                return
              }
              res.end(JSON.stringify({ content }))
            } catch (err) {
              res.statusCode = err.killed ? 504 : 500
              res.end(
                JSON.stringify({
                  error: err.killed
                    ? 'OpenCode timed out'
                    : `OpenCode error: ${err.message?.slice(0, 200)}`,
                })
              )
            } finally {
              try {
                unlinkSync(promptFile)
              } catch {}
              try {
                rmdirSync(tmpDir)
              } catch {}
            }
          })
          return
        }

        // /api/generate-tabs
        if (url === '/api/generate-tabs') {
          res.setHeader('Content-Type', 'application/json')
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            let payload
            try {
              payload = JSON.parse(body)
            } catch {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
              return
            }
            const { song } = payload
            if (!song) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Provide song data' }))
              return
            }
            const { title, artist, bpm } = song
            const chordList = (song.chords || [])
              .slice(0, 8)
              .map((c) => c.name)
              .join(' ')
            const prompt = `Generate the recognizable melody/tab line for playing "${title}" by ${artist} at ${bpm || 120} BPM. The chord progression is: ${chordList}. Output ONLY valid JSON (no markdown, no code fences, no explanation) in this exact format: {"leadNotes":[{"pitch":"E4","stringIndex":1,"fret":0,"position":0,"duration":2,"technique":"normal"}],"parts":[{"id":"riff-1","type":"riff","name":"Main Riff","startBeat":0,"endBeat":16,"notes":[{"pitch":"E4","stringIndex":1,"fret":0,"position":0,"duration":2,"technique":"normal"}]}]}. Each note needs: pitch (e.g. "E4","G4","A4"), stringIndex (0-5 low E to high E), fret (0=open, 1-24), position (beat number), duration (beats), technique ("normal","hammer-on","pull-off","slide","bend","vibrato"). Group notes into named parts: type must be one of "riff","solo","intro","melody","lead". Each part needs id, type, name, startBeat, endBeat, and notes array. Generate 20-60 notes total across 1-4 parts. Output ONLY the JSON object.`
            const tmpDir = mkdtempSync(join(tmpdir(), 'guitar-tabs-'))
            const promptFile = join(tmpDir, 'prompt.txt')
            try {
              writeFileSync(promptFile, prompt, 'utf8')
              const escapedPath = promptFile.replace(/'/g, "'\\''")
              const cmd = `cat '${escapedPath}' | ${OPENCODE_PATH} run --format json -m opencode-go/glm-5.1 -- "$(cat '${escapedPath}')"`
              const stdout = execSync(cmd, {
                timeout: 15000,
                maxBuffer: 1024 * 1024,
                cwd: PROJECT_DIR,
                env: { ...process.env, FORCE_COLOR: '0' },
                encoding: 'utf8',
              })
              const lines = stdout
                .trim()
                .split('\n')
                .filter((l) => l.trim())
              let content = ''
              for (const line of lines) {
                try {
                  content += JSON.parse(line).part?.text || ''
                } catch {
                  content += line
                }
              }
              content = content
                .replace(/^```json\n?/, '')
                .replace(/\n?```$/, '')
                .trim()
              let notes = []
              let parts = []
              try {
                const parsed = JSON.parse(content)
                notes = parsed.notes || parsed.leadNotes || []
                parts = parsed.parts || []
              } catch {
                const m = content.match(/\{[\s\S]*\}/)
                if (m)
                  try {
                    const parsed = JSON.parse(m[0])
                    notes = parsed.notes || parsed.leadNotes || []
                    parts = parsed.parts || []
                  } catch {}
              }
              const leadNotes = notes.map((n) => ({
                pitch: n.pitch || '',
                stringIndex: n.stringIndex ?? 0,
                fret: n.fret ?? 0,
                position: n.position ?? 0,
                duration: n.duration ?? 1,
                technique: n.technique || 'normal',
              }))
              const songParts = parts.map((p, i) => ({
                id: p.id || `part-${i + 1}`,
                type: p.type || 'riff',
                name: p.name || `Part ${i + 1}`,
                startBeat: p.startBeat ?? 0,
                endBeat: p.endBeat ?? 0,
                notes: (p.notes || []).map((n) => ({
                  pitch: n.pitch || '',
                  stringIndex: n.stringIndex ?? 0,
                  fret: n.fret ?? 0,
                  position: n.position ?? 0,
                  duration: n.duration ?? 1,
                  technique: n.technique || 'normal',
                })),
              }))
              res.end(JSON.stringify({ leadNotes, parts: songParts }))
            } catch {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to generate tabs' }))
            } finally {
              try {
                unlinkSync(promptFile)
              } catch {}
              try {
                rmdirSync(tmpDir)
              } catch {}
            }
          })
          return
        }

        // Not an API route - pass through
        next()
      })
    },
  }
}
