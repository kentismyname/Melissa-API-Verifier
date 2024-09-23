const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const csvWriter = require('csv-writer').createObjectCsvWriter;

const results = [];
const apiKey = 'B7ssYAtP3b5n024Nqvz4P_**nSAcwXpxhQ0PC2lXxuDAZ-**';
const inputCsvFile = 'input.csv'; // Input CSV file name
const outputCsvFile = 'output.csv'; // Output CSV file name

// Function to generate a random string for the t parameter
function generateT() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Function to verify data using Melissa API
async function verifyData(FullName, FullAddress, City, State, Postal) {
    const tValue = generateT();
    const url = `https://personator.melissadata.net/v3/WEB/ContactVerify/doContactVerify?act=Check%26Verify%26Move%26Append&full=${encodeURIComponent(FullName)}&a1=${encodeURIComponent(FullAddress)}&city=${encodeURIComponent(City || '')}&state=${encodeURIComponent(State || '')}&postal=${encodeURIComponent(Postal || '')}&format=json&cols=NameFull%26AddressLine1%26PhoneNumber%26EmailAddress%26Age&id=${apiKey}&t=${tValue}`;
    
    console.log('Request URL:', url); // Log the request URL for debugging
    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.Records && data.Records.length > 0) {
            const record = data.Records[0];
            return {
                FullName: record.NameFull || 'N/A',
                FullAddress: record.AddressLine1 || 'N/A',
                City: record.City || 'N/A',
                State: record.State || 'N/A',
                Postal: record.Postal || 'N/A',
                PhoneNumber: record.PhoneNumber || 'N/A',
                Email: record.EmailAddress || 'N/A',
                Age: record.Age || 'N/A'
            };
        } else {
            console.log(`No results for: ${FullName}`);
            return {
                FullName: FullName,
                FullAddress: FullAddress,
                City: City,
                State: State,
                Postal: Postal,
                PhoneNumber: 'N/A',
                Email: 'N/A',
                Age: 'N/A'
            };
        }
    } catch (error) {
        console.error('Error verifying data:', error.response ? error.response.data : error.message);
        return {
            FullName: FullName,
            FullAddress: 'N/A',
            PhoneNumber: 'N/A',
            Email: 'N/A',
            Age: 'N/A'
        };
    }
}

// Read input CSV and process each row
async function processCsv() {
    const promises = []; // Store promises here

    fs.createReadStream(inputCsvFile)
        .pipe(csv())
        .on('data', (row) => {
            console.log('Input Row:', row); // Log each input row for debugging
            const { FullName, FullAddress, City, State, Postal } = row; // Read additional columns
            const promise = verifyData(FullName, FullAddress, City, State, Postal); // Pass them to the function
            promises.push(promise); // Add the promise to the array
        })
        .on('end', async () => {
            // Wait for all promises to resolve
            results.push(...await Promise.all(promises));

            // Write results to output CSV
            const outputData = results.map(r => ({
                FullName: r.FullName,
                FullAddress: r.FullAddress,
                City: r.City,
                State: r.State,
                Postal: r.Postal,
                PhoneNumber: r.PhoneNumber,
                Email: r.Email,
                Age: r.Age
            }));
            
            console.log('Output Data:', JSON.stringify(outputData, null, 2)); // Log the output data

            const writer = csvWriter({
                path: outputCsvFile,
                header: [
                    { id: 'FullName', title: 'Full Name' },
                    { id: 'FullAddress', title: 'Full Address' },
                    {id: 'City', title: 'City'},
                    {id: 'State', title: 'State'},
                    {id: 'Postal', title: 'Postal'},                    
                    { id: 'PhoneNumber', title: 'Phone Number' },
                    { id: 'Email', title: 'Email' },
                    { id: 'Age', title: 'Age' }
                ]
            });

            await writer.writeRecords(outputData);
            console.log('Output written to CSV file successfully.');
        });
}

// Start processing the CSV file
processCsv();
