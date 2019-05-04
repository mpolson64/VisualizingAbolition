# OceansAndContinentsTESTBED
Testing playground for Oceans and Continents database page

## Instructions

### Running locally
1. Clone repository and install dependencies `npm i`
2. In src/index.js ensure the call to `d3.csv` points to the local CSV and the other line is commented out
```
d3.csv('boc.csv').then((rawData) => {
// d3.csv('../wp-content/uploads/2019/05/boc.csv').then((rawData) => {
```
3. In dist/index.html ensure the href on the download link points to the local CSV
```
<a id="downloadRawBtn" href="boc.csv" download="OceansAndContinentsRaw.csv">Download
```
4. Run `npm run-script start` and the site will run in a new browser window

### Compiling for Wordpress upload
1. Clone repository and install dependencies `npm i`
2. In src/index.js ensure the call to `d3.csv` points to the uploaded CSV and the other line is commented out
```
// d3.csv('boc.csv').then((rawData) => {
d3.csv('../wp-content/uploads/2019/05/boc.csv').then((rawData) => {
```
3. In dist/index.html ensure the href on the download link points to the uploaded CSV
```
<a id="downloadRawBtn" href="../wp-content/uploads/2019/05/boc.csv" download="OceansAndContinentsRaw.csv">Download
```
4. Run `npm run-script build` and the site's bundled javascript will be exported to dist/main.js

### Uploading HTML changes to Wordpress
1. Perform the steps listed in the previous section **Compiling for Wordpress upload**
2. From the Wordpress administrator dashboard go to the Pages tab on the left and select the Database page
3. Click Edit with Elementor
4. Hover over the main body of the page and click the blue pencil in the upper right-hand corner
5. Copy the text from dist/index.html into the newly appeared sidebar on the left
6. Delete the line
```
<script type="text/javascript" src="main.js"></script>
```
7. Click green Update button in bottom left

### Uploading Javascript changes to Wordpress
1. Perform the steps listed in the previous section **Compiling for Wordpress upload**
2. From the Wordpress administrator dashboard go to the Pages tab on the left and select the Database page
3. Scroll down to find second script entry text box (for scripts on the `body`)
4. Copy text from dist/main.js into the text box (may cause the dashboard to lag for a moment)
5. Click blue update button in upper right-hand corner

### Uploading CSV changes to Wordpress
1. Name the new csv file `boc.csv` on your local machine
2. From the Wordpress administrator dashboard go to the Media tab on the left
3. Click Add New button at the top of the page and follow the dialog boxes to upload `boc.csv`
4. After the file has been uploaded you will be taken to the Edit Media page; copy the portion of the File URL from the information panel on the right after the IP address (e.g. /wp-content/uploads/2019/05/boc.csv)
5. Replace references to the old URL to the new URL in both dist/index.html and src/index.js, in the download buttons href and `d3.csv` call respectively. These references will always surround the URL with quotes and preface them with .. (e.g. "../wp-content/uploads/2019/05/boc.csv")
6. **After changing the CSV you must recompile the site and upload changes to the HTML and Javascript as described in the previous sections. Failing to do so will break the site.**
