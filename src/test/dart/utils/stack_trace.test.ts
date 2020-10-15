import * as assert from "assert";
import { parseStackFrame } from "../../../shared/utils/stack_trace";

const texts = [
	"",
	// Dart
	"#0      List.[] ",
	"#1      main ",
	"#2      _startIsolate.<anonymous closure> ",
	"#345    _RawReceivePortImpl._handleMessage ",
	// Flutter
	"flutter:   Builder ",
	// Flutter web
	"[_firstBuild] ",
	"<fn> ",
];
const uris = [
	"dart:async",
	"dart:isolate-patch/isolate_patch.dart",
	"package:foo/foo.dart",
	"package:flutter/src/scheduler/binding.dart",
	"file:///Users/danny/Dev/flutter_gallery/lib/pages/demo.dart",
	// Flutter web
	"lib/_engine/engine/window.dart",
];
const line = 123;
const col = 45;

function getValidStackFrames(prefix: string, uri: string, withLineCol: boolean): string[] {
	return withLineCol
		? [
			// Dart/Flutter
			`${prefix}(${uri}:${line}:${col})`,
			`${prefix}(${uri}:${line}:${col}))`, // This extra closing paren exists in Dart stacks 🤷‍♂️
			// Flutter web
			`${uri} ${line}:${col}        ${prefix}`,
		]
		: [
			// Dart/Flutter
			`${prefix}(${uri})`,
			`${prefix}(${uri}))`, // This extra closing paren exists in Dart stacks 🤷‍♂️
			// Flutter web
			`${uri}        ${prefix}`,
		];
}

describe("stack trace", () => {
	it("parses large strings quickly", () => {
		const largeString = "A".repeat(50000);
		const startTime = Date.now();
		const result = parseStackFrame(largeString);
		const endTime = Date.now();
		const timeTakenSeconds = (endTime - startTime) / 1000;
		console.log(`Took ${timeTakenSeconds}s to parse ${largeString.length} character string`);
		assert.ok(timeTakenSeconds < 10);
	});

	describe("parses", () => {
		for (const text of texts) {
			for (const uri of uris) {
				for (const withLineCol of [true, false]) {
					const validStackFrames = getValidStackFrames(text, uri, withLineCol);
					for (const validStackFrame of validStackFrames) {
						const result = parseStackFrame(validStackFrame);
						it(validStackFrame, () => {
							const result = parseStackFrame(validStackFrame);
							assert.ok(result);
							assert.equal(result.text, text.trim());
							assert.equal(result.sourceUri, uri);
							assert.equal(result.line, withLineCol ? line : undefined);
							assert.equal(result.col, withLineCol ? col : undefined);
						});
					}
				}
			}
		}
	});
});
