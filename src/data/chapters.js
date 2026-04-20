import chapter001 from './chapters/chapter001';
import chapter002 from './chapters/chapter002';
import chapter003 from './chapters/chapter003';
import chapter004 from './chapters/chapter004';
import chapter005 from './chapters/chapter005';
import chapter006 from './chapters/chapter006';
import chapter007 from './chapters/chapter007';
import chapter008 from './chapters/chapter008';
import chapter009 from './chapters/chapter009';
import chapter010 from './chapters/chapter010';

export const CHAPTERS = [
  chapter001,
  chapter002,
  chapter003,
  chapter004,
  chapter005,
  chapter006,
  chapter007,
  chapter008,
  chapter009,
  chapter010,
]

export function getChapterById(id) {
  return CHAPTERS.find(ch => ch.id === id)
}

export function getLessonById(chapterId, lessonId) {
  const chapter = getChapterById(chapterId)
  if (!chapter) return null
  return chapter.lessons.find(l => l.id === lessonId)
}

export function getAllLessons() {
  return CHAPTERS.flatMap(ch => ch.lessons.map(l => ({ ...l, chapter: ch })))
}

export function getNextLesson(chapterId, lessonId) {
  const chapter = getChapterById(chapterId)
  if (!chapter) return null

  const currentIndex = chapter.lessons.findIndex(l => l.id === lessonId)
  if (currentIndex === -1) return null

  // Next lesson in same chapter
  if (currentIndex < chapter.lessons.length - 1) {
    return {
      lesson: chapter.lessons[currentIndex + 1],
      chapter: chapter
    }
  }

  // First lesson of next chapter
  const nextChapter = CHAPTERS.find(ch => ch.number === chapter.number + 1)
  if (nextChapter && nextChapter.lessons.length > 0) {
    return {
      lesson: nextChapter.lessons[0],
      chapter: nextChapter
    }
  }

  return null
}

export function getPreviousLesson(chapterId, lessonId) {
  const chapter = getChapterById(chapterId)
  if (!chapter) return null

  const currentIndex = chapter.lessons.findIndex(l => l.id === lessonId)
  if (currentIndex === -1) return null

  // Previous lesson in same chapter
  if (currentIndex > 0) {
    return {
      lesson: chapter.lessons[currentIndex - 1],
      chapter: chapter
    }
  }

  // Last lesson of previous chapter
  const prevChapter = CHAPTERS.find(ch => ch.number === chapter.number - 1)
  if (prevChapter && prevChapter.lessons.length > 0) {
    return {
      lesson: prevChapter.lessons[prevChapter.lessons.length - 1],
      chapter: prevChapter
    }
  }

  return null
}
