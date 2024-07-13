import { meili, payload } from "src/services";
import type { MeiliDocument } from "src/shared/meilisearch/types";
import { Collections } from "src/shared/payload/constants";
import {
  formatInlineTitle,
  formatRichTextContentToString,
} from "src/shared/payload/format";

enum Indexes {
  DOCUMENT = "DOCUMENT",
}

export const synchronizeMeiliDocs = async () => {
  const version = await meili.getVersion();
  console.log("Success connecting to Meili!");
  console.log("Meili version:", version.pkgVersion);

  const indexes = await meili.getIndexes({ limit: 1_000 });

  await Promise.all(
    indexes.results.map((index) => {
      console.log("Deleting index", index.uid);
      return index.delete();
    })
  );

  await meili.createIndex(Indexes.DOCUMENT, { primaryKey: "meilid" });
  const index = meili.index(Indexes.DOCUMENT);
  await index.updatePagination({ maxTotalHits: 100_000 });
  await index.updateFilterableAttributes(["languages", "type"]);
  await index.updateSortableAttributes(["title", "updatedAt"]);
  await index.updateSearchableAttributes(["title", "content"]);
  await index.updateDistinctAttribute("id");
  // await index.updateDisplayedAttributes(["type", "page"]);

  const documents: MeiliDocument[] = [];

  const allIds = (await payload.getAllIds()).data;

  for (const slug of allIds.pages.slugs) {
    const page = (await payload.getPage(slug)).data;
    documents.push(
      ...page.translations.map<MeiliDocument>(
        ({ language, pretitle, title, subtitle, content, summary }) => ({
          meilid: `${page.id}_${language}`,
          id: page.id,
          languages: page.translations.map(({ language }) => language),
          title: formatInlineTitle({ pretitle, title, subtitle }),
          content: `${
            summary ? `${formatRichTextContentToString(summary)}\n\n\n` : ""
          }${formatRichTextContentToString(content)}`,
          updatedAt: Date.parse(page.updatedAt),
          type: Collections.Pages,
          data: page,
        })
      )
    );
  }

  for (const slug of allIds.collectibles.slugs) {
    const collectible = (await payload.getCollectible(slug)).data;
    documents.push(
      ...collectible.translations.map<MeiliDocument>(
        ({ language, pretitle, title, subtitle, description }) => ({
          meilid: `${collectible.id}_${language}`,
          id: collectible.id,
          languages: collectible.translations.map(({ language }) => language), // Add languages from languages field
          title: formatInlineTitle({ pretitle, title, subtitle }),
          ...(description
            ? { description: formatRichTextContentToString(description) }
            : {}),
          updatedAt: Date.parse(collectible.updatedAt),
          type: Collections.Collectibles,
          data: collectible,
        })
      )
    );
  }

  for (const slug of allIds.folders.slugs) {
    const folder = (await payload.getFolder(slug)).data;
    documents.push(
      ...folder.translations.map<MeiliDocument>(
        ({ language, title, description }) => ({
          meilid: `${folder.id}_${language}`,
          id: folder.id,
          languages: [],
          title,
          ...(description
            ? { description: formatRichTextContentToString(description) }
            : {}),
          type: Collections.Folders,
          data: folder,
        })
      )
    );
  }

  for (const id of allIds.audios.ids) {
    const audio = (await payload.getAudioByID(id)).data;
    documents.push(
      ...audio.translations.map<MeiliDocument>(
        ({ language, title, description }) => ({
          meilid: `${audio.id}_${language}`,
          id: audio.id,
          languages: audio.translations.map(({ language }) => language),
          title,
          ...(description
            ? { description: formatRichTextContentToString(description) }
            : {}),
          updatedAt: Date.parse(audio.updatedAt),
          type: Collections.Audios,
          data: audio,
        })
      )
    );
  }

  for (const id of allIds.images.ids) {
    const image = (await payload.getImageByID(id)).data;

    if (image.translations.length > 0) {
      documents.push(
        ...image.translations.map<MeiliDocument>(
          ({ language, title, description }) => ({
            meilid: `${image.id}_${language}`,
            id: image.id,
            languages: [],
            title,
            ...(description
              ? { description: formatRichTextContentToString(description) }
              : {}),
            updatedAt: Date.parse(image.updatedAt),
            type: Collections.Images,
            data: image,
          })
        )
      );
    } else {
      documents.push({
        meilid: image.id,
        id: image.id,
        languages: [],
        title: image.filename,
        updatedAt: Date.parse(image.updatedAt),
        type: Collections.Images,
        data: image,
      });
    }
  }

  for (const id of allIds.videos.ids) {
    const video = (await payload.getVideoByID(id)).data;
    documents.push(
      ...video.translations.map<MeiliDocument>(
        ({ language, title, description }) => ({
          meilid: `${video.id}_${language}`,
          id: video.id,
          languages: video.translations.map(({ language }) => language),
          title,
          ...(description
            ? { description: formatRichTextContentToString(description) }
            : {}),
          updatedAt: Date.parse(video.updatedAt),
          type: Collections.Videos,
          data: video,
        })
      )
    );
  }

  for (const id of allIds.recorders.ids) {
    const recorder = (await payload.getRecorderByID(id)).data;
    if (recorder.translations.length > 0) {
      documents.push(
        ...recorder.translations.map<MeiliDocument>(
          ({ language, biography }) => ({
            meilid: `${recorder.id}_${language}`,
            id: recorder.id,
            languages: [],
            title: recorder.username,
            ...(biography
              ? { description: formatRichTextContentToString(biography) }
              : {}),
            type: Collections.Recorders,
            data: recorder,
          })
        )
      );
    } else {
      documents.push({
        meilid: recorder.id,
        id: recorder.id,
        languages: [],
        title: recorder.username,
        type: Collections.Recorders,
        data: recorder,
      });
    }
  }

  for (const id of allIds.files.ids) {
    const file = (await payload.getFileByID(id)).data;
    if (file.translations.length > 0) {
      documents.push(
        ...file.translations.map<MeiliDocument>(
          ({ language, title, description }) => ({
            meilid: `${file.id}_${language}`,
            id: file.id,
            languages: [],
            title,
            ...(description
              ? { description: formatRichTextContentToString(description) }
              : {}),
            updatedAt: Date.parse(file.updatedAt),
            type: Collections.Files,
            data: file,
          })
        )
      );
    } else {
      documents.push({
        meilid: file.id,
        id: file.id,
        languages: [],
        title: file.filename,
        updatedAt: Date.parse(file.updatedAt),
        type: Collections.Files,
        data: file,
      });
    }
  }

  for (const id of allIds.chronologyEvents.ids) {
    const chronologyEvent = (await payload.getChronologyEventByID(id)).data;
    documents.push(
      ...chronologyEvent.events.flatMap((event, index) =>
        event.translations.map<MeiliDocument>(
          ({ language, description, title, notes }) => ({
            meilid: `${chronologyEvent.id}_${index}_${language}`,
            id: `${chronologyEvent.id}_${index}`,
            languages: event.translations.map(({ language }) => language),
            ...(title ? { title } : {}),
            ...(description || notes
              ? {
                  content: `${
                    description
                      ? formatRichTextContentToString(description)
                      : ""
                  }\n\n${notes ? formatRichTextContentToString(notes) : ""}`,
                }
              : {}),
            type: Collections.ChronologyEvents,
            data: { date: chronologyEvent.date, event },
          })
        )
      )
    );
  }

  console.log("Adding", documents.length, "documents");

  await index.addDocuments(documents);
};
