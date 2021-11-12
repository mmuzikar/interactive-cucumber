import { Scenario } from "./Scenario";
import Parser from "gherkin/dist/src/Parser";
import AstBuilder from "gherkin/dist/src/AstBuilder";
import * as messages from "@cucumber/messages";

export class Feature {
    source: string
    uri: string

    readonly name?: string
    readonly tags?: string[]

    readonly description?: string;

    scenarios?: Scenario[]

    static featureId: number = 0
    static parser = new Parser(new AstBuilder(messages.IdGenerator.incrementing()))

    private parsedFeature?: messages.Feature

    background?: messages.Background

    constructor(source: string, uri: string) {
        this.source = source
        this.uri = uri
        this.parse()

        if (this.parsedFeature) {
            this.description = this.parsedFeature.description
            this.name = this.parsedFeature.name
            this.tags = this.parsedFeature.tags.map(tag => tag.name)

            this.scenarios = []

            this.background = this.parsedFeature.children.find(child => child.background)?.background as messages.Background

            this.parsedFeature.children.forEach(child => {
                if (child.scenario) {
                    this.scenarios?.push(new Scenario(child.scenario, this.background))

                } else if (child.rule) {
                    //TODO
                }
            })
        }
    }

    private parse() {
        const document: messages.GherkinDocument = Feature.parser.parse(this.source)

        if (document.feature) {
            this.parsedFeature = document.feature;
        }
    }
}