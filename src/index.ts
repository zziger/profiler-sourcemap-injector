import {BasicSourceMapConsumer, IndexedSourceMapConsumer, SourceMapConsumer} from "source-map";
import {IProfile} from "./IProfile";

export interface IInjectConfig {
    sourceMapDir: string;
    sourceDir?: string;
    profileSourceRoot?: string;

    log?: (message: string) => void;
    transformSource?: (path: string) => string | Promise<string>;
    sourceMapProvider?: (path: string) => string | null | Promise<string | null>;
}

export async function injectSourceMaps(profile: string | IProfile, output: string | null, config: IInjectConfig): Promise<IProfile> {
    const log: Required<IInjectConfig>['log'] = config.log ?? console.log;

    const transformSource: Required<IInjectConfig>['transformSource'] = config.transformSource ?? ((path: string) => {
        const sourceDir = config.sourceDir ?? '';
        if (config.profileSourceRoot != null)
            return path.replace(config.profileSourceRoot, config.sourceDir ?? '');
        else return sourceDir + path;
    });

    const sourceMapProvider: Required<IInjectConfig>['sourceMapProvider'] = config.sourceMapProvider ?? (async (filePath: string) => {
        const fs = await import('fs');
        const path = await import('path');
        const sourceMapPath = path.join(config.sourceMapDir, filePath.replace(/^\/|\.js$/g, '') + '.map');
        if (!fs.existsSync(sourceMapPath)) return null;
        return fs.readFileSync(sourceMapPath, 'utf-8');
    });

    if (typeof profile === 'string') {
        const fs = await import('fs');
        profile = JSON.parse(fs.readFileSync(profile, 'utf-8')) as IProfile;
    }

    let sourceMaps = new Map<string, BasicSourceMapConsumer | IndexedSourceMapConsumer | null>();

    async function getSourceMap(name: string) {
        if (sourceMaps.has(name)) return sourceMaps.get(name);
        const sourceMap = await sourceMapProvider(name);

        if (sourceMap == null) {
            log("Failed to find source map for " + name);
            sourceMaps.set(name, null);
            return null;
        }

        const consumer = await SourceMapConsumer.with(sourceMap, null, e => e);
        sourceMaps.set(name, consumer);
        return consumer;
    }

    for (const node of profile.nodes) {
        if (node.callFrame.url.startsWith('(')) continue;

        const sourceMap = await getSourceMap(node.callFrame.url);
        if (!sourceMap) continue;

        const original = sourceMap.originalPositionFor({
            line: node.callFrame.lineNumber,
            column: node.callFrame.columnNumber
        });

        if (original.source == null) {
            log(`Failed to find original position for ${node.callFrame.url}:${node.callFrame.lineNumber}:${node.callFrame.columnNumber}`);
            continue;
        }

        node.callFrame.url = await transformSource(original.source);
        node.callFrame.columnNumber = original.column ?? -1;
        node.callFrame.lineNumber = original.line ?? -1;

        if (node.positionTicks) {
            for (const tick of node.positionTicks) {
                const original = sourceMap.originalPositionFor({
                    line: tick.line,
                    column: 0
                });

                tick.line = original.line ?? -1;
            }
        }
    }

    if (output) {
        const fs = await import('fs');
        fs.writeFileSync(output, JSON.stringify(profile));
    }

    return profile;
}