import fetch from "node-fetch";
import cheerio from "cheerio";
import {parse} from "csv-parse";
import unzipper from "unzipper";
import {pipeline} from "stream";
import {promisify} from "util";

const pipelineAsync = promisify(pipeline);

const BATCH_SIZE = 150;

const vehicleKeys = [
  "firstRegDate",
  "firstRegDateSLO",
  "conformityCert",
  "statusDate",
  "statusID",
  "status",
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
    return isoDate;
  } catch (error) {
    console.error("Error converting date to ISO format:", error);
    return null;
  }
};

const sendPostRequest = async (data: VehicleData[]) => {
  try {
    const formattedData = data
      .map((vehicle) => {
        const formattedFirstRegDate = convertDateToISO(vehicle.firstRegDate);
        const formattedFirstRegDateSLO = convertDateToISO(
          vehicle.firstRegDateSLO
        );

        if (!formattedFirstRegDate || !formattedFirstRegDateSLO) {
          console.error("Invalid date(s):", {
            firstRegDate: formattedFirstRegDate,
            firstRegDateSLO: formattedFirstRegDateSLO,
          });
          return null;
        }

        return {
          firstRegDate: formattedFirstRegDate,
          firstRegDateSlo: formattedFirstRegDateSLO,
          brand: vehicle.brand,
          vin: vehicle.vin,
          maxSpeed: Number(vehicle.maxSpeed),
          fuelType: vehicle.fuelTypeDesc,
          kilometers: Number(vehicle.kilometersMiles),
          model: vehicle.commercialDesignation,
          status: vehicle.status,
          userAge: Number(vehicle.userAge),
          userLegalStatus: vehicle.userLegalStatus,
          userIsOwner: vehicle.userIsOwner,
          userCity: vehicle.userRegAuthDesc,
          userMunicipality: vehicle.userMunicipalityDesc,
          ownerAge: Number(vehicle.ownerAge),
          ownerLegalStatus: vehicle.ownerLegalStatus,
          vehicleCategory: vehicle.vehicleCategoryDesc,
          envLabel: vehicle.envLabel,
          originCountry: vehicle.countryDesc,
          weight: Number(vehicle.vehicleWeight),
          nominalPower: Number(vehicle.nominalPower),
          engineDisplacement: Number(vehicle.engineDisplacement),
          nominalEngineSpeed: Number(vehicle.nominalEngineSpeed),
          engineType: vehicle.engineType,
          color: vehicle.vehicleColorDesc,
          bodyType: vehicle.bodyTypeDesc,
        };
      })
      .filter(Boolean); // Remove any null entries

    if (formattedData.length === 0) {
      console.error("No valid data to send");
      return;
    }

    //console.log("Sending data:", formattedData);

    const response = await fetch("http://localhost:3001/vehicles/scraper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
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

const sendInBatches = async (allRecords: VehicleData[]) => {
  for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
    const batch = allRecords.slice(i, i + BATCH_SIZE);
    await sendPostRequest(batch);
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
      const allRecords: VehicleData[] = [];

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
            }),
            async function* (source) {
              for await (const record of source) {
                yield record;
              }
            },
            async function* (records) {
              for await (const record of records) {
                const vehicleData: VehicleData = record;
                //console.log(record);
                allRecords.push(vehicleData);
                if (allRecords.length % BATCH_SIZE === 0) {
                  await sendInBatches(allRecords);
                  allRecords.length = 0; // clear the array
                }
              }
            }
          );
        } else {
          entry.autodrain();
        }
      }

      await sendPostRequest(allRecords);
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
  //console.log("Scraped Links:", links);

  for (const link of links) {
    await downloadAndParseZip(link);
  }
};

main();
