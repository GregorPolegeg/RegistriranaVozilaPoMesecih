import fetch from "node-fetch";
import cheerio from "cheerio";
import {parse} from "csv-parse";
import unzipper from "unzipper";
import {pipeline} from "stream";
import {promisify} from "util";

const pipelineAsync = promisify(pipeline);

const vehicleKeys = [
  "firstRegDate",
  "firstRegDateSLO",
  "conformityCert",
  "statusDate",
  "statusID",
  "statusDesc",
  "firstRegUnit",
  "firstRegPlateArea",
  "firstRegPlateType",
  "userAge",
  "userLegalStatus",
  "userGender",
  "userIsOwner",
  "userRegAuthCode",
  "userRegAuthDesc",
  "userMunicipalityCode",
  "userMunicipalityDesc",
  "ownerAge",
  "ownerLegalStatus",
  "ownerGender",
  "brand",
  "modelCode",
  "commercialDesignation",
  "countryDesc",
  "countryCode",
  "cocIssueDate",
  "vin",
  "identificationCode",
  "maxPermissibleWeight",
  "maxPermissibleWeightAtReg",
  "maxPermissibleWeightGroupAtReg",
  "vehicleWeight",
  "vehicleCategoryCode",
  "vehicleCategoryDesc",
  "vehicleHomologationCode",
  "axleCount",
  "wheelbase",
  "rearOverhang",
  "maxAxleLoadDist",
  "axleLoadLimits",
  "trailer",
  "semitrailer",
  "centralAxleTrailer",
  "unbrakedTrailer",
  "verticalLoadTractiveDevice",
  "brakeSystemPressure",
  "engineDisplacement",
  "nominalPower",
  "fuelTypeDesc",
  "fuelTypeCode",
  "nominalEngineSpeed",
  "engineCode",
  "engineType",
  "nominalContinuousPower",
  "operatingVoltage",
  "driveBatteries",
  "engineDesignation",
  "powerToWeightRatio",
  "vehicleColorCode",
  "vehicleColorDesc",
  "seatCount",
  "standingPlaces",
  "maxSpeed",
  "atRest",
  "atEngineSpeed",
  "inMotion",
  "co",
  "idleSpeed",
  "coContent",
  "oilTemp",
  "highIdleSpeed",
  "coContentHighIdle",
  "lambdaValue",
  "oilTempHighIdle",
  "hc",
  "nox",
  "hcNox",
  "dieselParticles",
  "corrAbsCoeffDiesel",
  "idleSpeedDiesel",
  "maxEngineSpeedDiesel",
  "oilTempDiesel",
  "co2",
  "co2WLTP",
  "combinedFuelConsumption",
  "envCategory",
  "bodyTypeCode",
  "bodyTypeDesc",
  "additionalBodyDesc",
  "protectiveConstrHomologCode",
  "length",
  "width",
  "height",
  "permissibleTiresWheels",
  "towbarHomologCode",
  "towbarRating",
  "conformityCertIssueDate",
  "envLabel",
  "airSuspensionOrEquiv",
  "vehiclePurpose",
  "commercialDesignationUntilFirst",
  "kilometersMiles", // Remove za drugi link
] as const;

type VehicleData = Record<(typeof vehicleKeys)[number], string>;

const scrapeFirstLinkInEach = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Unexpected response ${response.statusText}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const links: string[] = [];

    $(".inner-row.small-12.medium-6.column.actions").each((_, element) => {
      const firstAnchor = $(element).find("a").first();
      const href = firstAnchor.attr("href");
      if (
        href &&
        href.startsWith("https://podatki.gov.si/dataset/") &&
        href.endsWith(".zip")
      ) {
        links.push(href);
      }
    });

    return links;
  } catch (error) {
    console.error("Error scraping the website:", error);
    return [];
  }
};

// Function to convert date from 'DD.MM.YYYY' to ISO 8601 string in UTC
const convertDateToISO = (dateString: string) => {
  try {
    console.log("Original date string:", dateString); // Log the original date string
    const [day, month, year] = dateString
      .split(".")
      .map((part) => parseInt(part, 10));
    if (!day || !month || !year) {
      throw new Error("Invalid date");
    }
    const date = new Date(year, month - 1, day); // Months are 0-indexed in JavaScript Date
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    const isoDate = date.toISOString().split("T")[0];
    console.log("Converted ISO date:", isoDate); // Log the converted ISO date
    return isoDate;
  } catch (error) {
    console.error("Error converting date to ISO format:", error);
    return null;
  }
};

const sendPostRequest = async (data: VehicleData) => {
  try {
    const formattedFirstRegDate = convertDateToISO(data.firstRegDate);
    const formattedFirstRegDateSLO = convertDateToISO(data.firstRegDateSLO);

    if (!formattedFirstRegDate || !formattedFirstRegDateSLO) {
      console.error("Invalid date(s):", {
        firstRegDate: formattedFirstRegDate,
        firstRegDateSLO: formattedFirstRegDateSLO,
      });
      return;
    }

    const sendBody = {
      firstRegDate: formattedFirstRegDate,
      firstRegDateSlo: formattedFirstRegDateSLO,
      brand: data.brand,
      vin: data.vin,
      maxSpeed: data.maxSpeed ? parseFloat(data.maxSpeed) : 0,
      fuelTypeDesc: data.fuelTypeDesc,
      kilometersMiles: data.kilometersMiles
        ? parseFloat(data.kilometersMiles)
        : 0,
    };

    console.log("Sending data:", sendBody);

    const response = await fetch("http://213.161.9.83:3001/vehicle/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to send POST request: ${response.statusText}, ${errorText}`
      );
    }

    const responseData = await response.json();
    console.log("POST request successful:", responseData);
  } catch (error) {
    console.error("Error sending POST request:", error);
  }
};

const downloadAndParseZip = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Unexpected response ${response.statusText}`);

    const bufferStream = response.body?.pipe(
      unzipper.Parse({forceStream: true})
    );

    if (bufferStream) {
      for await (const entry of bufferStream) {
        const fileName = entry.path;
        if (fileName.endsWith(".csv")) {
          console.log("Extracting and parsing:", fileName);

          await pipelineAsync(
            entry,
            parse({
              columns: vehicleKeys.slice(),
              skip_empty_lines: true,
              delimiter: ";",
              from_line: 2,
            }),
            async function* (source) {
              for await (const record of source) {
                yield record;
              }
            },
            async function* (records) {
              for await (const record of records) {
                // here send post request to  http://213.161.9.83:3001/vehicle/add with this data as body
                const vehicleData: VehicleData = record as VehicleData;
                console.log(record);
                await sendPostRequest(vehicleData);
              }
            }
          );
        } else {
          entry.autodrain();
        }
      }
    }
  } catch (error) {
    console.error("Failed to download or parse file:", error);
  }
};

const main = async () => {
  const targetUrl =
    "https://podatki.gov.si/dataset/evidenca-registriranih-vozil-presek-stanja"; // >2018 format
  //Drugi link: https://podatki.gov.si/dataset/prvic-registrirana-vozila-po-mesecih

  const links = await scrapeFirstLinkInEach(targetUrl);
  console.log("Scraped Links:", links);

  for (const link of links) {
    await downloadAndParseZip(link);
  }
};

main();
