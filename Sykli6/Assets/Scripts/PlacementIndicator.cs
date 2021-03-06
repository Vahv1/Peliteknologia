using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.Experimental.XR;
using UnityEngine.XR.ARSubsystems;

public class PlacementIndicator : MonoBehaviour
{
    public GameObject gameCube;
    public GameObject placementIndicator;

    private ARRaycastManager arRaycastManager;
    private Pose placementPose;
    private bool placementPoseIsValid;

    void Start()
    {
        arRaycastManager = FindObjectOfType<ARRaycastManager>();
    }

    void Update()
    {
        // Päivitetään asetusindikaattoria koko ajan
        UpdatePlacementPose();
        UpdatePlacementIndicator();

        // Asetetaan pelikenttä jos pelaaja täppäsi näyttöä ja asetusindikaattori oli hyväksytyssä paikassa
        if (placementPoseIsValid && Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began)
        {
            PlaceGameField();
        }
    }

    // Asettaa objektit pelikentälle indikaattorin sijaintiin
    private void PlaceGameField()
    {
        // Luo kolme palikkaa pelikentäksi indikaattorin sijaintiin
        Instantiate(gameCube, placementPose.position + new Vector3(-0.3f, 0, 0), placementPose.rotation);
        Instantiate(gameCube, placementPose.position, placementPose.rotation);
        Instantiate(gameCube, placementPose.position + new Vector3(0.3f, 0, 0), placementPose.rotation);

        // Piilottaa indikaattorin ja disablaa skriptin ettei voi toista pelikenttää luoda
        placementIndicator.SetActive(false);
        enabled = false;
    }

    // Päivittää indikaattorin sijainnin ja näkyvyyden
    private void UpdatePlacementIndicator()
    {
        // Asetetaan indikaattorin näkyvyys sen mukaan, onko sen hetkinen Pose hyväksytty
        placementIndicator.SetActive(placementPoseIsValid);
        // Siirretään indikaattori placementPosen sijaintiin
        placementIndicator.transform.SetPositionAndRotation(placementPose.position, placementPose.rotation);
    }

    // Päivitetään kameran osoittama sijainti
    private void UpdatePlacementPose()
    {
        // Raycast ruudun keskeltä
        var screenCenter = Camera.current.ViewportToScreenPoint(new Vector3(0.5f, 0.5f));
        var hits = new List<ARRaycastHit>();
        arRaycastManager.Raycast(screenCenter, hits);

        // Asetetaan sijainti hyväksytyksi, jos raycast osui mihinkään
        placementPoseIsValid = hits.Count > 0;

        // Asetetaan placementPoseen ensimmäinen osuttu objekti
        if (placementPoseIsValid)
        {
            placementPose = hits[0].pose;
            var cameraForward = Camera.current.transform.forward;
            var cameraBearing = new Vector3(cameraForward.x, 0, cameraForward.z).normalized;
            placementPose.rotation = Quaternion.LookRotation(cameraBearing);
        }
    }
}
