import {Component, enableProdMode} from "angular2/core";

enableProdMode();

@Component({
    selector: "my-app",
    template: `
<StackLayout orientation="vertical">
    <Label [text]="message" class="title" (tap)="message = 'OHAI'"></Label>
</StackLayout>
`,
})
export class AppComponent {
    public message: string = "Hello, Angular!";
}